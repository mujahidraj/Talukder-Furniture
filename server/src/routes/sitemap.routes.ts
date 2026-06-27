import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const CLIENT_URL = process.env.CLIENT_URL || 'https://talukderfurniture.com';

router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${CLIENT_URL}/sitemap.xml`);
});

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ 
      select: { slug: true, updatedAt: true }, 
      where: { isActive: true } 
    });
    const categories = await prisma.category.findMany({ 
      select: { slug: true } 
    });
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CLIENT_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${CLIENT_URL}/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${CLIENT_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${CLIENT_URL}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

    categories.forEach(cat => {
      xml += `
  <url>
    <loc>${CLIENT_URL}/shop?category=${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    products.forEach(prod => {
      xml += `
  <url>
    <loc>${CLIENT_URL}/product/${prod.slug}</loc>
    <lastmod>${prod.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `\n</urlset>`;
    
    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
});

export default router;
