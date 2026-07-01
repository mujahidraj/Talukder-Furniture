import prisma from '../config/db.js';
import slugify from 'slugify';
import { AppError } from '../middleware/errorHandler.js';

export const getSets = async (query: any = {}) => {
  const { page = 1, limit = 20, category, admin } = query;
  const parsedLimit = parseInt(limit, 10);
  const take = Math.min(Math.max(parsedLimit, 1), 100); // Max 100 per page to prevent DoS
  const skip = (parseInt(page, 10) - 1) * take;

  const where: any = {};

  if (admin !== 'true') {
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

  const [sets, total] = await Promise.all([
    prisma.set.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
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

export const getSetBySlug = async (slug: string) => {
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
      products: true,
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
    updateData.slug = slugify(data.name, { lower: true, strict: true });
  }
  
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
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

  return prisma.set.update({
    where: { id: parseInt(id.toString(), 10) },
    data: updateData,
  });
};

export const deleteSet = async (id: string | number) => {
  return prisma.set.delete({
    where: { id: parseInt(id.toString(), 10) },
  });
};

export const bulkDeleteSets = async (ids: number[]) => {
  return prisma.set.deleteMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};
