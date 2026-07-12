import prisma from '../config/db.js';
import slugify from 'slugify';
import { AppError } from '../middleware/errorHandler.js';

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
  const updateData = { ...data };
  if (data.name && !data.slug) {
    const baseSlug = slugify(data.name, { lower: true, strict: true });
    let slug = baseSlug;
    
    let existing = await prisma.category.findUnique({ where: { slug } });
    let counter = 1;
    while (existing && existing.id !== parseInt(id, 10)) {
      slug = `${baseSlug}-${counter}`;
      existing = await prisma.category.findUnique({ where: { slug } });
      counter++;
    }
    updateData.slug = slug;
  }

  return prisma.category.update({
    where: { id: parseInt(id, 10) },
    data: updateData,
  });
};

export const deleteCategory = async (id) => {
  const catId = parseInt(id, 10);
  
  // Find all child categories
  const children = await prisma.category.findMany({ where: { parentId: catId } });
  const childIds = children.map(c => c.id);
  
  // Delete all products associated with the main category or its children
  // (Prisma will automatically cascade to ProductImage and ProductVariant)
  const categoryIdsToDeleteProducts = [catId, ...childIds];
  if (categoryIdsToDeleteProducts.length > 0) {
    await prisma.product.deleteMany({
      where: { categoryId: { in: categoryIdsToDeleteProducts } }
    });
  }
  
  // Delete all child categories
  if (childIds.length > 0) {
    await prisma.category.deleteMany({
      where: { parentId: catId }
    });
  }
  
  // Finally, delete the main category
  return prisma.category.delete({
    where: { id: catId },
  });
};
