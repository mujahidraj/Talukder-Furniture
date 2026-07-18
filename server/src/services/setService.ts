import prisma from '../config/db.js';
import slugify from 'slugify';
import { AppError } from '../middleware/errorHandler.js';
import { deleteFilesByUrls } from '../utils/fileCleaner.js';

export const getSets = async (query: any = {}) => {
  const { page = 1, limit = 20, category, isAdmin, q, price, sort = 'default' } = query;
  const parsedLimit = parseInt(limit, 10);
  const take = Math.min(Math.max(parsedLimit, 1), 100); // Max 100 per page to prevent DoS
  const skip = (parseInt(page, 10) - 1) * take;

  const where: any = {};

  if (!isAdmin) {
    where.isActive = true;
  }

  if (category) {
    const targetCategory = await prisma.category.findUnique({
      where: { slug: category },
      include: { children: true }
    });

    if (targetCategory) {
      const categoryIds = [targetCategory.id, ...targetCategory.children.map(c => c.id)];
      where.categoryId = { in: categoryIds };
    } else {
      where.category = {
        slug: category,
      };
    }
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
    ];
  }

  // Price filter
  if (price && price !== 'all') {
    if (price === '100000+') {
      where.basePrice = { gte: 100000 };
    } else {
      const [minStr, maxStr] = price.split('-');
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);
      if (!isNaN(min) && !isNaN(max)) {
        where.basePrice = { gte: min, lte: max };
      }
    }
  }

  let orderBy: any;
  switch (sort) {
    case 'name-asc':
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'name-desc':
    case 'name_desc':
      orderBy = { name: 'desc' };
      break;
    case 'price-asc':
    case 'price_asc':
      orderBy = { basePrice: 'asc' };
      break;
    case 'price-desc':
    case 'price_desc':
      orderBy = { basePrice: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [sets, total] = await Promise.all([
    prisma.set.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        category: true,
      },
    }),
    prisma.set.count({ where }),
  ]);

  return {
    sets,
    total,
    page: parseInt(page, 10),
    totalPages: Math.ceil(total / take),
    hasMore: skip + take < total,
  };
};

export const getSetBySlug = async (slug: string, isAdmin = false) => {
  const set = await prisma.set.findUnique({
    where: { slug },
    include: {
      category: true,
      products: {
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        }
      }
    },
  });

  if (!set) {
    throw new AppError('Set not found', 404);
  }

  // Block inactive sets for public users
  if (!isAdmin && !set.isActive) {
    throw new AppError('Set not found', 404);
  }

  return set;
};

export const getSetById = async (id: string | number) => {
  const set = await prisma.set.findUnique({
    where: { id: parseInt(id.toString(), 10) },
    include: {
      category: {
        include: {
          parent: true
        }
      },
      products: {
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        }
      },
    },
  });

  if (!set) {
    throw new AppError('Set not found', 404);
  }

  return set;
};

export const createSet = async (data: any) => {
  const slug = data.slug || slugify(data.name, { lower: true, strict: true });

  const productConnections = data.productIds ? data.productIds.map((id: number) => ({ id })) : [];

  return prisma.set.create({
    data: {
      name: data.name,
      slug,
      sku: data.sku,
      categoryId: data.categoryId,
      description: data.description,
      basePrice: data.basePrice,
      discountPercentage: data.discountPercentage,
      isActive: data.isActive !== false,
      imageUrl: data.imageUrl,
      imageUrls: data.imageUrls || [],
      products: {
        connect: productConnections
      }
    },
  });
};

export const updateSet = async (id: string | number, data: any) => {
  const updateData: any = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) {
    updateData.slug = data.slug;
  } else if (data.name !== undefined) {
    // #17 Fix: Add slug collision handling (like productService)
    let candidateSlug = slugify(data.name, { lower: true, strict: true });
    const setId = parseInt(id.toString(), 10);
    const existingWithSlug = await prisma.set.findUnique({ where: { slug: candidateSlug } });
    if (existingWithSlug && existingWithSlug.id !== setId) {
      let suffix = 2;
      const MAX_SLUG_ATTEMPTS = 100;
      let found = false;
      while (suffix <= MAX_SLUG_ATTEMPTS + 1) {
        const trySlug = `${candidateSlug}-${suffix}`;
        const conflict = await prisma.set.findUnique({ where: { slug: trySlug } });
        if (!conflict || conflict.id === setId) {
          candidateSlug = trySlug;
          found = true;
          break;
        }
        suffix++;
      }
      if (!found) {
        throw new AppError('Unable to generate a unique slug for this set.', 400);
      }
    }
    updateData.slug = candidateSlug;
  }
  
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.sku !== undefined) updateData.sku = data.sku;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
  if (data.discountPercentage !== undefined) updateData.discountPercentage = data.discountPercentage;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.imageUrls !== undefined) updateData.imageUrls = data.imageUrls;

  if (data.productIds) {
    updateData.products = {
      set: data.productIds.map((pid: number) => ({ id: pid }))
    };
  }

  const setId = parseInt(id.toString(), 10);

  // If images are being updated, delete the old ones that are no longer used
  if (data.imageUrl !== undefined || data.imageUrls !== undefined) {
    const oldSet = await prisma.set.findUnique({ where: { id: setId } });
    if (oldSet) {
      const urlsToDelete: string[] = [];
      if (data.imageUrl !== undefined && oldSet.imageUrl && oldSet.imageUrl !== data.imageUrl) {
        urlsToDelete.push(oldSet.imageUrl);
      }
      if (data.imageUrls !== undefined && oldSet.imageUrls.length > 0) {
        for (const oldUrl of oldSet.imageUrls) {
          if (!data.imageUrls.includes(oldUrl)) {
            urlsToDelete.push(oldUrl);
          }
        }
      }
      if (urlsToDelete.length > 0) {
        await deleteFilesByUrls(urlsToDelete);
      }
    }
  }

  return prisma.set.update({
    where: { id: setId },
    data: updateData,
  });
};

export const deleteSet = async (id: string | number) => {
  const setId = parseInt(id.toString(), 10);
  const set = await prisma.set.findUnique({ where: { id: setId } });
  
  if (set) {
    const urlsToDelete: string[] = [];
    if (set.imageUrl) urlsToDelete.push(set.imageUrl);
    if (set.imageUrls) urlsToDelete.push(...set.imageUrls);
    if (urlsToDelete.length > 0) {
      await deleteFilesByUrls(urlsToDelete);
    }
  }

  return prisma.set.delete({
    where: { id: setId },
  });
};

export const bulkDeleteSets = async (ids: number[]) => {
  const sets = await prisma.set.findMany({ where: { id: { in: ids } } });
  
  const urlsToDelete: string[] = [];
  sets.forEach(set => {
    if (set.imageUrl) urlsToDelete.push(set.imageUrl);
    if (set.imageUrls) urlsToDelete.push(...set.imageUrls);
  });

  if (urlsToDelete.length > 0) {
    await deleteFilesByUrls(urlsToDelete);
  }

  return prisma.set.deleteMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};
