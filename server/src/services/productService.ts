import prisma from '../config/db.js';
import slugify from 'slugify';
import { AppError } from '../middleware/errorHandler.js';
import { deleteImage } from '../middleware/upload.js';

export const getProducts = async (query: any = {}) => {
  const { page = 1, limit = 20, category, sort = 'default', q, admin, status, isFeatured, price } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const where: any = {};

  // If not admin, only show active products
  if (admin !== 'true') {
    where.isActive = true;
  }

  // Explicit status filter
  if (status === 'active') where.isActive = true;
  if (status === 'draft') where.isActive = false;

  // Explicit featured filter
  if (isFeatured === 'true') where.isFeatured = true;

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

  let orderBy: any = { createdAt: 'desc' };
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
    case 'views-desc':
    case 'views_desc':
      orderBy = { viewCount: 'desc' };
      break;
    case 'views-asc':
    case 'views_asc':
      orderBy = { viewCount: 'asc' };
      break;
    case 'enquiries-desc':
    case 'enquiries_desc':
      orderBy = { enquiryCount: 'desc' };
      break;
    case 'enquiries-asc':
    case 'enquiries_asc':
      orderBy = { enquiryCount: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page: parseInt(page, 10),
    totalPages: Math.ceil(total / take),
    hasMore: skip + take < total,
  };
};

export const getProductBySlug = async (slug) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' },
      },
      variants: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' },
      },
      variants: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

export const createProduct = async (data) => {
  const slug = data.slug || slugify(data.name, { lower: true, strict: true });

  return prisma.product.create({
    data: {
      name: data.name,
      slug,
      sku: data.sku,
      categoryId: data.categoryId,
      materials: data.materials,
      priceDisplay: data.priceDisplay,
      basePrice: data.basePrice,
      discountPercentage: data.discountPercentage,
      overview: data.overview,
      keyFeatures: data.keyFeatures,
      careMaintenance: data.careMaintenance,
      warrantyInfo: data.warrantyInfo,
      returnExchangePolicy: data.returnExchangePolicy,
      isFeatured: data.isFeatured || false,
      isActive: data.isActive !== false,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      colors: data.colors || null,
      ...(data.images && data.images.length > 0 && {
        images: {
          create: data.images.map((url: string, index: number) => ({ url, order: index }))
        }
      })
    },
  });
};

export const updateProduct = async (id, data) => {
  const updateData = { ...data };
  if (data.name && !data.slug) {
    updateData.slug = slugify(data.name, { lower: true, strict: true });
  }

  // Handle explicitly undefined vs null for prices if needed, 
  // but updateData already has them mapped from {...data}
  
  if (data.images) {
    const oldImages = await prisma.productImage.findMany({ where: { productId: parseInt(id, 10) } });
    
    await prisma.productImage.deleteMany({ where: { productId: parseInt(id, 10) } });
    updateData.images = {
      create: data.images.map((url: string, index: number) => ({ url, order: index }))
    };

    // Delete old physical files if they are not in the new image URLs
    for (const oldImage of oldImages) {
      if (!data.images.includes(oldImage.url)) {
        await deleteImage(oldImage.url, oldImage.thumbUrl);
      }
    }
  }

  if (data.colors !== undefined) {
    updateData.colors = data.colors || null;
  }

  return prisma.product.update({
    where: { id: parseInt(id, 10) },
    data: updateData,
  });
};

export const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id, 10) },
    include: { images: true },
  });

  if (product && product.images) {
    for (const image of product.images) {
      await deleteImage(image.url, image.thumbUrl);
    }
  }

  return prisma.product.delete({
    where: { id: parseInt(id, 10) },
  });
};

export const searchProducts = async (q, page = 1, limit = 8) => {
  return getProducts({ q, page, limit });
};

export const incrementProductView = async (slug: string) => {
  return prisma.product.update({
    where: { slug },
    data: {
      viewCount: {
        increment: 1
      }
    }
  });
};

export const incrementEnquiryCount = async (referenceNumber: string) => {
  // Reference number can be a SKU or ID
  const isNumericId = !isNaN(Number(referenceNumber));
  
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { sku: referenceNumber },
        ...(isNumericId ? [{ id: parseInt(referenceNumber, 10) }] : [])
      ]
    }
  });

  if (product) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        enquiryCount: {
          increment: 1
        }
      }
    });
  }
};

export const bulkDeleteProducts = async (ids: number[]) => {
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { images: true },
  });

  for (const product of products) {
    if (product.images) {
      for (const image of product.images) {
        await deleteImage(image.url, image.thumbUrl);
      }
    }
  }

  return prisma.product.deleteMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};
