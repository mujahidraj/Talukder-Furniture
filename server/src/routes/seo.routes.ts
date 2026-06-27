import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const CLIENT_URL = process.env.CLIENT_URL || 'https://talukderfurniture.com';

// This endpoint serves pure HTML with meta tags to social media crawlers
router.get('/product/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { images: true }
    });

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const title = `${product.metaTitle || product.name} | Talukder Furniture`;
    const description = product.metaDescription || product.overview || `Buy the premium ${product.name} from Talukder Furniture Ltd.`;
    const imageUrl = product.images.length > 0 ? (product.images[0] as any).url : `${CLIENT_URL}/furniture_logo.jpg`;
    const productUrl = `${CLIENT_URL}/product/${product.slug}`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        
        <!-- Open Graph -->
        <meta property="og:type" content="product">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:url" content="${productUrl}">
        <meta property="og:site_name" content="Talukder Furniture">
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${imageUrl}">
        
        <!-- Redirect normal users just in case they hit this endpoint directly -->
        <meta http-equiv="refresh" content="0;url=${productUrl}">
      </head>
      <body>
        <p>Redirecting to <a href="${productUrl}">${productUrl}</a>...</p>
      </body>
      </html>
    `;

    res.type('text/html').send(html);
  } catch (error) {
    console.error('Error in SEO proxy:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
