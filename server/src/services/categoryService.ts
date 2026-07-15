import prisma from '../config/db.js';
import slugify from 'slugify';
import { AppError } from '../middleware/errorHandler.js';
import { deleteFilesByUrls } from '../utils/fileCleaner.js';

export const getTree = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { products: true, sets: true }
      },
      children: {
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { products: true, sets: true }
          },
          children: {
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

export const getCategoryBySlug = async (slug) => {
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
  
  const categoryIdsToDeleteProducts = [catId, ...childIds];
  
  if (categoryIdsToDeleteProducts.length > 0) {
    // Fetch products to delete their physical images before deleting the DB records
    const productsToDelete = await prisma.product.findMany({
      where: { categoryId: { in: categoryIdsToDeleteProducts } },
      include: { images: true }
    });

    const fileUrlsToDelete: string[] = [];
    productsToDelete.forEach(prod => {
      if (prod.images) {
        prod.images.forEach(img => {
          if (img.url) fileUrlsToDelete.push(img.url);
          if (img.thumbUrl) fileUrlsToDelete.push(img.thumbUrl);
        });
      }
    });

    if (fileUrlsToDelete.length > 0) {
      await deleteFilesByUrls(fileUrlsToDelete);
    }

    await prisma.product.deleteMany({
      where: { categoryId: { in: categoryIdsToDeleteProducts } }
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
