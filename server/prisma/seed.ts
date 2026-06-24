import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const generateSlug = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').trim();

async function main() {
  console.log('Start seeding...');

  // 1. Admin
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@talukder-furniture.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@123456';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      role: 'superadmin',
    },
  });
  console.log('✅ Admin user seeded');

  // 2. Categories
  // 2. Categories
  const mainCategories = [
    {
      name: 'Office Furniture',
      subs: ['Office Tables', 'Office Chairs', 'Public Seating', 'Office Sofa', 'Storage & Cabinets']
    },
    {
      name: 'Living Room',
      subs: ['Sofa Set', 'Center Table', 'TV Cabinet', 'Divan']
    },
    {
      name: 'Dining Room',
      subs: ['Dining Table', 'Dining Chair', 'Showcase', 'Tea Trolley']
    },
    {
      name: 'Bedroom Collection',
      subs: ['Bed', 'Wardrobe', 'Dressing Table', 'Bedside Table']
    },
    {
      name: 'Institutional Furniture',
      subs: ['School Desk', 'Hospital Bed', 'Library Bookshelf']
    },
    {
      name: 'Other Furniture',
      subs: ['Shoe Rack', 'Wall Shelf']
    },
    {
      name: 'Kids Collection',
      subs: ['Bunk Bed', 'Kids Wardrobe', 'Study Table']
    }
  ];

  let createdCategories: any[] = [];
  let subCategoryIds: number[] = [];

  // Clear existing categories (optional, but upsert is fine)
  for (const [index, mainCat] of mainCategories.entries()) {
    const parentCategory = await prisma.category.upsert({
      where: { slug: generateSlug(mainCat.name) },
      update: { name: mainCat.name, order: index },
      create: {
        name: mainCat.name,
        slug: generateSlug(mainCat.name),
        order: index,
      },
    });
    createdCategories.push(parentCategory);

    // Create sub-categories
    for (const [subIndex, subName] of mainCat.subs.entries()) {
      const subSlug = generateSlug(`${mainCat.name}-${subName}`);
      const subCategory = await prisma.category.upsert({
        where: { slug: subSlug },
        update: { name: subName, parentId: parentCategory.id, order: subIndex },
        create: {
          name: subName,
          slug: subSlug,
          parentId: parentCategory.id,
          order: subIndex,
        },
      });
      subCategoryIds.push(subCategory.id);
    }
  }
  console.log('✅ Categories seeded');

  // 3. Products
  const products = [
    {
      name: 'Executive Office Chair',
      categoryId: subCategoryIds[0] || createdCategories[0].id,
      sku: 'OFF-CHR-001',
      materials: 'Mesh, Steel Frame',
      overview: 'Ergonomic office chair with lumbar support.',
      priceDisplay: '৳ 8,500',
    },
    {
      name: 'Modern Fabric Sofa',
      categoryId: subCategoryIds.find(id => id > 5) || createdCategories[1].id,
      sku: 'LIV-SOF-002',
      materials: 'Premium Fabric, Wood Frame',
      overview: 'Comfortable 3-seater sofa for modern living rooms.',
      priceDisplay: '৳ 35,000',
    },
    {
      name: 'King Size Bed',
      categoryId: subCategoryIds.find(id => id > 10) || createdCategories[3].id,
      sku: 'BED-KNG-001',
      materials: 'Solid Mahogany Wood',
      overview: 'Luxurious king size bed with intricate carving.',
      priceDisplay: '৳ 45,000',
    }
  ];

  for (const p of products) {
    const slug = generateSlug(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        categoryId: p.categoryId,
        sku: p.sku,
        materials: p.materials,
        overview: p.overview,
        priceDisplay: p.priceDisplay,
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Brown', hex: '#8B4513' }],
        sizes: [{ label: 'Standard', dimensions: 'Standard Size' }],
        isFeatured: true,
        images: {
          create: [
            { url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(p.name)}`, isPrimary: true, order: 1 }
          ]
        }
      }
    });
  }
  console.log('✅ Products seeded');

  // 4. ContactLead
  await prisma.contactLead.create({
    data: {
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '01700000000',
      message: 'Hello, I want to inquire about office furniture.',
      source: 'contact-form',
      status: 'new',
    }
  });
  console.log('✅ Contact Leads seeded');

  // 5. Stores
  const stores = [
    {
      name: 'Talukder Furniture Dhaka',
      address: 'House #21, Road #21, Nikunja 2, Dhaka-1229',
      phone: '+880 1966-333355',
      email: 'dhaka@talukder-furniture.com',
      order: 0,
    },
    {
      name: 'Chittagong Showroom',
      address: 'Agrabad, Chittagong',
      phone: '+880 1966-333356',
      email: 'ctg@talukder-furniture.com',
      order: 1,
    }
  ];

  for (const store of stores) {
    const existing = await prisma.store.findFirst({ where: { name: store.name } });
    if (!existing) {
      await prisma.store.create({ data: store });
    }
  }
  console.log('✅ Stores seeded');

  // 6. JobPost
  await prisma.jobPost.create({
    data: {
      title: 'Sales Executive',
      department: 'Sales',
      location: 'Dhaka',
      type: 'full-time',
      description: 'Looking for a dynamic sales executive with 2 years of experience.',
      requirements: 'Bachelor degree. Good communication skills.',
      applyInstructions: 'Email your CV to hr@talukder-furniture.com'
    }
  });
  console.log('✅ Job Posts seeded');

  // 7. ContentBlock
  await prisma.contentBlock.create({
    data: {
      page: 'about',
      section: 'history',
      title: 'Our History',
      body: 'Talukder Furniture started its journey in 1990 with a vision to provide quality furniture.'
    }
  });
  console.log('✅ Content Blocks seeded');

  // 8. FaqItem
  await prisma.faqItem.create({
    data: {
      groupName: 'General Questions',
      question: 'Do you offer home delivery?',
      answer: 'Yes, we offer home delivery across the country.',
      order: 1,
    }
  });
  console.log('✅ FAQs seeded');

  // 9. HeroSlide
  await prisma.heroSlide.create({
    data: {
      imageUrl: 'https://via.placeholder.com/1920x1080?text=Premium+Furniture',
      title: 'Premium Furniture',
      subtitle: 'Elevate your living space',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      order: 1,
    }
  });
  console.log('✅ Hero Slides seeded');

  // 10. Trust Badges
  const badges = [
    { icon: 'delivery', title: 'Free & fast delivery', description: 'Available for selected locations.' },
    { icon: 'returns', title: '14-Day Returns', description: 'Money back guarantee if you are not satisfied.' },
    { icon: 'support', title: '24/7 Support', description: 'Our support team is always here to help.' },
    { icon: 'discounts', title: 'Member Discounts', description: 'Special offers and discounts for members.' }
  ];

  for (let i = 0; i < badges.length; i++) {
    const badge = badges[i];
    const existing = await prisma.trustBadge.findFirst({ where: { title: badge.title } });
    if (!existing) {
      await prisma.trustBadge.create({
        data: {
          ...badge,
          order: i,
        }
      });
    }
  }
  console.log('✅ Trust Badges seeded');

  // 11. TeamMember
  await prisma.teamMember.create({
    data: {
      name: 'Jane Doe',
      title: 'Head of Design',
      imageUrl: 'https://via.placeholder.com/400x400?text=Jane+Doe',
      order: 1,
    }
  });
  console.log('✅ Team Members seeded');

  // 12. SiteSetting
  const settings = [
    { key: 'siteName', value: 'Talukder Furniture' },
    { key: 'contactEmail', value: 'info@talukder-furniture.com' },
    { key: 'contactPhone', value: '+880 1966-333355' }
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s
    });
  }
  console.log('✅ Site Settings seeded');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
