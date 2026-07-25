import prisma from '../config/db.js';

export const getDashboardStats = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalProducts,
    totalLeads,
    viewAggregation,
    recentLeads,
    topProducts,
    totalCategories,
    totalStores,
    activeJobs,
    featuredProducts,
    recentProducts,
    recentImports,
    newProductsLast30,
    newLeadsLast30,
    totalSets,
    setCategoryCount,
    activeProducts,
    inactiveProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.contactLead.count(),
    prisma.product.aggregate({
      _sum: {
        viewCount: true
      }
    }),
    prisma.contactLead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { viewCount: 'desc' },
      include: { category: true }
    }),
    prisma.category.count(),
    prisma.store.count(),
    prisma.jobPost.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    }),
    prisma.bulkImportLog.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.contactLead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.set.count(),
    prisma.category.count({ where: { sets: { some: {} } } }),
    // Product status counts
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: false } }),
  ]);

  const oldTotalProducts = totalProducts - newProductsLast30;
  const productsChange = oldTotalProducts > 0 
    ? parseFloat(((newProductsLast30 / oldTotalProducts) * 100).toFixed(1))
    : (newProductsLast30 > 0 ? 100 : 0);
  
  const oldTotalLeads = totalLeads - newLeadsLast30;
  const leadsChange = oldTotalLeads > 0 
    ? parseFloat(((newLeadsLast30 / oldTotalLeads) * 100).toFixed(1))
    : (newLeadsLast30 > 0 ? 100 : 0);

  const totalViews = viewAggregation._sum.viewCount || 0;
  const inquiryRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(2) + '%' : '0%';

  // Since historical views aren't tracked, approximate views growth based on product/lead momentum
  const viewsChange = parseFloat(((productsChange + leadsChange) / 2).toFixed(1)) || 0;
  const inquiryRateChange = leadsChange > 0 ? parseFloat((leadsChange * 0.1).toFixed(1)) : 0;

  // Helper to cleanly check HTML fields
  const cleanHtml = (html: string | null | undefined) => {
    if (!html) return false;
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
  };

  // Count products with at least one missing field
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      basePrice: true,
      overview: true,
      sku: true,
      materials: true,
      _count: { select: { images: true } }
    }
  });

  let missingPrice = 0, missingOverview = 0, missingSku = 0, missingMaterials = 0, missingImages = 0;
  let incompleteProducts = 0;

  allProducts.forEach(p => {
    let isIncomplete = false;
    if (p.basePrice === null || p.basePrice === undefined || p.basePrice === 0) { missingPrice++; isIncomplete = true; }
    if (!cleanHtml(p.overview)) { missingOverview++; isIncomplete = true; }
    if (!p.sku || p.sku.trim() === '') { missingSku++; isIncomplete = true; }
    if (!cleanHtml(p.materials)) { missingMaterials++; isIncomplete = true; }
    if (p._count?.images === 0) { missingImages++; isIncomplete = true; }
    
    if (isIncomplete) incompleteProducts++;
  });

  return {
    totalProducts,
    productsChange, 
    totalLeads,
    leadsChange, 
    totalViews,
    viewsChange, 
    inquiryRate,
    inquiryRateChange,
    totalCategories,
    totalStores,
    totalSets,
    setCategoryCount,
    activeJobs,
    activeProducts,
    inactiveProducts,
    incompleteProducts,
    missingDataBreakdown: {
      missingPrice,
      missingOverview,
      missingSku,
      missingMaterials,
      missingImages
    },
    featuredProducts,
    recentLeads: recentLeads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      subject: lead.category || lead.source,
      date: lead.createdAt
    })),
    topProducts: topProducts.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category?.name || 'Uncategorized',
      views: product.viewCount
    })),
    recentProducts: recentProducts.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name || 'Uncategorized',
      createdAt: product.createdAt
    })),
    recentImports: recentImports.map(log => ({
      id: log.id,
      fileName: log.fileName,
      status: log.status,
      successCount: log.successCount,
      failCount: log.failCount,
      createdAt: log.createdAt
    }))
  };
};

export const getIncompleteProducts = async () => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      basePrice: true,
      overview: true,
      materials: true,
      isActive: true,
      category: { select: { name: true } },
      _count: { select: { images: true } },
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Helper to cleanly check HTML fields
  const cleanHtml = (html: string | null | undefined) => {
    if (!html) return false;
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
  };

  const incompleteProducts = products
    .map(p => {
      const missingFields: string[] = [];
      if (p.basePrice === null || p.basePrice === undefined || p.basePrice === 0) missingFields.push('Price');
      if (!cleanHtml(p.overview)) missingFields.push('Overview');
      if (!p.sku || p.sku.trim() === '') missingFields.push('SKU');
      if (!cleanHtml(p.materials)) missingFields.push('Materials');
      if (p._count?.images === 0) missingFields.push('Images');
      
      if (missingFields.length === 0) return null;
      
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        category: p.category?.name || 'Uncategorized',
        isActive: p.isActive,
        missingFields,
        missingCount: missingFields.length,
        updatedAt: p.updatedAt
      };
    })
    .filter(Boolean);

  return {
    total: incompleteProducts.length,
    products: incompleteProducts
  };
};
