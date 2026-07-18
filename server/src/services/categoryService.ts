import prisma from '../config/db.js';
import slugify from 'slugify';
import { AppError } from '../middleware/errorHandler.js';
import { deleteFilesByUrls } from '../utils/fileCleaner.js';

export const getTree = async (isAdmin = false) => {
  const activeFilter = isAdmin ? {} : { isActive: true };

  const categories = await prisma.category.findMany({
    where: activeFilter,
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { products: true, sets: true }
      },
      children: {
        where: activeFilter,
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { products: true, sets: true }
          },
          children: {
            where: activeFilter,
            orderBy: { order: 'asc' },
            include: {
              _count: {
                select: { products: true, sets: true }
              }
            }
          }
        }
      },
    },
  });

  const rootCategories = categories.filter(c => c.parentId === null).map(cat => {
    // Calculate total products including sub-categories (products + sets)
    let childProductCount = 0;
    if (cat.children) {
      for (const child of cat.children) {
        childProductCount += (child._count?.products || 0) + (child._count?.sets || 0);
        if (child.children) {
          for (const subChild of child.children) {
            childProductCount += (subChild._count?.products || 0) + (subChild._count?.sets || 0);
          }
        }
      }
    }
    return {
      ...cat,
      totalProducts: (cat._count?.products || 0) + (cat._count?.sets || 0) + childProductCount
    };
  });
  
  return rootCategories;
};

export const getCategoryBySlug = async (slug, isAdmin = false) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: true,
      parent: true,
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Block inactive categories for public users
  if (!isAdmin && !category.isActive) {
    throw new AppError('Category not found', 404);
  }

  // Filter out inactive children for public users
  if (!isAdmin && category.children) {
    category.children = category.children.filter(c => c.isActive);
  }

  return category;
};

export const createCategory = async (data) => {
  const baseSlug = data.slug || slugify(data.name, { lower: true, strict: true });
  let slug = baseSlug;
  
  let existing = await prisma.category.findUnique({ where: { slug } });
  let counter = 1;
  while (existing) {
    slug = `${baseSlug}-${counter}`;
    existing = await prisma.category.findUnique({ where: { slug } });
    counter++;
  }
  
  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      parentId: data.parentId,
      imageUrl: data.imageUrl,
      order: data.order || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

export const updateCategory = async (id, data) => {
  const catId = parseInt(id, 10);
  const updateData = { ...data };
  
  if (data.name && !data.slug) {
    const baseSlug = slugify(data.name, { lower: true, strict: true });
    let slug = baseSlug;
    
    let existing = await prisma.category.findUnique({ where: { slug } });
    let counter = 1;
    while (existing && existing.id !== catId) {
      slug = `${baseSlug}-${counter}`;
      existing = await prisma.category.findUnique({ where: { slug } });
      counter++;
    }
    updateData.slug = slug;
  }

  if (data.imageUrl !== undefined) {
    const oldCategory = await prisma.category.findUnique({ where: { id: catId } });
    if (oldCategory && oldCategory.imageUrl && oldCategory.imageUrl !== data.imageUrl) {
      await deleteFilesByUrls([oldCategory.imageUrl]);
    }
  }

  return prisma.category.update({
    where: { id: catId },
    data: updateData,
  });
};

export const deleteCategory = async (id) => {
  const catId = parseInt(id, 10);
  
  // Find the category and its children to delete their images
  const category = await prisma.category.findUnique({ where: { id: catId } });
  if (!category) throw new AppError('Category not found', 404);

  const children = await prisma.category.findMany({ where: { parentId: catId } });
  const childIds = children.map(c => c.id);
  
  const categoryIdsToReassign = [catId, ...childIds];
  
  if (categoryIdsToReassign.length > 0) {
    // 1. Ensure "Uncategorized" category exists
    let uncategorized = await prisma.category.findUnique({
      where: { slug: 'uncategorized' }
    });

    if (!uncategorized) {
      uncategorized = await prisma.category.create({
        data: {
          name: 'Uncategorized',
          slug: 'uncategorized',
          isActive: false // Usually you don't want "Uncategorized" to show up publicly by default
        }
      });
    }

    // 2. Prevent deleting the Uncategorized category itself
    if (categoryIdsToReassign.includes(uncategorized.id)) {
      throw new AppError('Cannot delete the Uncategorized category', 400);
    }

    // 3. Reassign products to Uncategorized
    await prisma.product.updateMany({
      where: { categoryId: { in: categoryIdsToReassign } },
      data: { categoryId: uncategorized.id }
    });
    
    // 4. Reassign sets to Uncategorized (since Sets also belong to a category)
    await prisma.set.updateMany({
      where: { categoryId: { in: categoryIdsToReassign } },
      data: { categoryId: uncategorized.id }
    });
  }
  
  // Delete all child categories and their images
  if (childIds.length > 0) {
    const childImageUrls = children.map(c => c.imageUrl).filter(Boolean) as string[];
    if (childImageUrls.length > 0) await deleteFilesByUrls(childImageUrls);

    await prisma.category.deleteMany({
      where: { parentId: catId }
    });
  }
  
  // Finally, delete the main category and its image
  if (category.imageUrl) {
    await deleteFilesByUrls([category.imageUrl]);
  }

  return prisma.category.delete({
    where: { id: catId },
  });
};
