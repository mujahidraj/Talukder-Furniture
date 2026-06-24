import prisma from '../config/db.js';

export const getDashboardStats = async () => {
  const [
    totalProducts,
    totalLeads,
    viewAggregation,
    recentLeads,
    topProducts,
    totalCategories,
    totalStores,
    activeJobs,
    featuredProducts
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
    prisma.product.count({ where: { isFeatured: true } })
  ]);

  const totalViews = viewAggregation._sum.viewCount || 0;
  // Calculate inquiry rate (Inquiries / Views * 100)
  const inquiryRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(2) + '%' : '0%';

  return {
    totalProducts,
    productsChange: 0, 
    totalLeads,
    leadsChange: 0, 
    totalViews,
    viewsChange: 0, 
    inquiryRate,
    inquiryRateChange: 0,
    totalCategories,
    totalStores,
    activeJobs,
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
    }))
  };
};
