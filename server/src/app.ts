import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import storeRoutes from './routes/store.routes.js';
import jobRoutes from './routes/job.routes.js';
import leadRoutes from './routes/lead.routes.js';
import faqRoutes from './routes/faq.routes.js';
import heroSlideRoutes from './routes/heroSlide.routes.js';
import trustBadgeRoutes from './routes/trustBadge.routes.js';
import teamRoutes from './routes/team.routes.js';
import bulkImportRoutes from './routes/bulkImport.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import sitemapRoutes from './routes/sitemap.routes.js';
import adminUserRoutes from './routes/adminUser.routes.js';
import seoRoutes from './routes/seo.routes.js';
import setRoutes from './routes/set.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", config.clientUrl],
    },
  },
}));

// CORS
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static file serving for uploads
app.use('/uploads', express.static(path.resolve(config.upload.localPath), {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Content-Disposition', 'inline');
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sets', setRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use('/api/trust-badges', trustBadgeRoutes);
app.use('/api/team-members', teamRoutes);
app.use('/api/admin/bulk-import', bulkImportRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/', sitemapRoutes);
app.use('/api/seo', seoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
