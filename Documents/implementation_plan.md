# Talukder Furniture — Full-Stack Catalog Website

Build a multi-page, SEO-friendly furniture catalog/showcase website (no e-commerce checkout/cart/payments) with a full admin panel, replicating the visual design from the 10 reference screenshots.

## User Review Required

> [!IMPORTANT]
> **SSR / Prerendering Decision**: Your spec requests React + Express (CSR). For proper SEO (crawlable `<title>`, meta tags, OG tags, JSON-LD), a CSR-only React app is insufficient — search engines may not fully index JS-rendered content. I propose **staying with React + Vite** but adding `vite-plugin-ssr` (or a lightweight Express SSR shell using `renderToPipeableStream`) to serve fully-rendered HTML for crawlers and first-load users. This avoids switching to Next.js. **Please confirm** you're okay with this SSR-lite approach, or if you'd prefer Next.js, or if you're fine with CSR + a Puppeteer-based prerendering step for a static SEO snapshot.

> [!IMPORTANT]
> **Price Display Strategy**: Reference screenshots show "৳ 0.00" on every product. Since this is a catalog (not e-commerce), I recommend: (a) keeping a `priceDisplay` field on each product (string, e.g. "Price on Request", "৳ 15,000", or empty to hide), controlled by admin. This way the admin decides per-product whether to show a price, show "Price on Request", or hide the line entirely. **Please confirm** or tell me to just hide all prices.

> [!WARNING]
> **Tailwind CSS Version**: You specified Tailwind CSS. I will use **Tailwind CSS v4** (the latest as of 2026) with the Vite plugin (`@tailwindcss/vite`). This uses CSS-first configuration (no `tailwind.config.js`), and theme tokens are defined via `@theme` in CSS. Let me know if you prefer Tailwind v3 instead.

> [!IMPORTANT]
> **Mobile Design**: No mobile screenshots were provided. I will design a sensible responsive experience: hamburger nav drawer, single-column product grids on mobile, stacked hero, collapsible footer sections, etc. I'll flag anything ambiguous during implementation.

## Open Questions

1. **Admin "Pages" dropdown in nav**: The reference shows a "Pages" dropdown in the header linking to About/Contact/FAQ/Store List/Career/Terms etc. Should this dropdown be hardcoded in the nav, or should admin be able to add/remove/reorder items in it?
   - **Recommendation**: Hardcode the list of page links since these are fixed content pages. Admin only edits page *content*, not which pages exist.

2. **Google Maps API Key**: The Contact page and Store List use embedded Google Maps. Should I use the `<iframe>` embed approach (free, no API key needed) or the JavaScript Maps API (requires billing-enabled API key)? 
   - **Recommendation**: Use `<iframe>` embeds for MVP — simpler, free, no API key needed for basic embeds.

3. **Email notifications for leads**: The spec mentions SMTP for admin notification on new contact/FAQ submissions. Should this be implemented in Phase 2 or deferred to Phase 8 (polish)?
   - **Recommendation**: Implement the email service in Phase 2 (backend core) with a feature flag / graceful skip if SMTP env vars are not set.

4. **Rich text editor for admin**: The 5-tab product info (overview, key features, care & maintenance, warranty, return policy) and content block pages need admin editing. Should I use:
   - (a) **TipTap** (modern, extensible, great for React)
   - (b) **React Quill** (simpler, well-known)
   - (c) **Plain textarea with Markdown** support
   - **Recommendation**: TipTap — it's the most modern, extensible, and has great React integration.

---

## Proposed Changes

### Phase 1 — Project Scaffolding

#### Monorepo Structure

```
talukder-furniture/
├── client/                    # React + Vite + Tailwind + Zustand
│   ├── public/
│   │   ├── robots.txt
│   │   └── favicon.ico
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css          # Tailwind + custom theme
│   │   ├── assets/            # Static assets (logo, icons)
│   │   ├── components/        # Shared UI components
│   │   │   ├── layout/        # Header, Footer, PageBanner, Breadcrumb
│   │   │   ├── ui/            # Button, Card, Modal, Accordion, Tabs
│   │   │   ├── product/       # ProductCard, ProductGrid, ImageGallery
│   │   │   └── common/        # TrustBadges, SearchOverlay, ScrollToTop
│   │   ├── pages/             # Route-level page components
│   │   │   ├── public/        # Homepage, Shop, ProductDetail, About, etc.
│   │   │   └── admin/         # Admin panel pages
│   │   ├── stores/            # Zustand stores
│   │   │   ├── useWishlistStore.js
│   │   │   ├── useSearchStore.js
│   │   │   ├── useAuthStore.js
│   │   │   └── useUIStore.js
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # API client, helpers, constants
│   │   │   ├── api.js         # Axios instance
│   │   │   ├── constants.js
│   │   │   └── utils.js
│   │   └── routes/            # Route definitions
│   │       ├── publicRoutes.jsx
│   │       └── adminRoutes.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── server/                    # Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── src/
│   │   ├── index.js           # Express app entry
│   │   ├── app.js             # Express app setup (cors, json, routes)
│   │   ├── config/            # env, db, storage config
│   │   ├── middleware/        # auth, upload, errorHandler, rateLimiter
│   │   ├── routes/            # Express route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic layer
│   │   ├── utils/             # Helpers (slug, excel, email)
│   │   └── validators/        # Input validation (Joi/Zod schemas)
│   ├── uploads/               # Local file storage (gitignored)
│   ├── package.json
│   └── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json               # Root workspace package.json
└── README.md
```

#### [NEW] Root `package.json` (npm workspaces)
- Workspaces: `["client", "server"]`
- Scripts: `dev`, `dev:client`, `dev:server`, `build`, `lint`

#### [NEW] `client/` — Vite React App
- Initialize with `npx create-vite` (React template)
- Install: `react-router-dom`, `zustand`, `axios`, `react-helmet-async`, `swiper` (carousels), `lucide-react` (icons)
- Tailwind v4 setup via `@tailwindcss/vite` plugin
- Custom theme tokens in `index.css`:
  - **Colors**: off-white bg `#faf9f7`, near-black footer `#1a1a1a`, warm taupe hero overlay `#6b5e50`, accent gold/brown `#8B7355`, text dark `#1a1a1a`, text muted `#6b6b6b`
  - **Fonts**: Serif display → `Playfair Display` (for headings like "We Are Talukder", "Our Picks For You"), Sans-serif body → `Inter`
  - **Spacing/sizing** matched to reference screenshots
- ESLint + Prettier config

#### [NEW] `server/` — Express App
- Initialize with `npm init`
- Install: `express`, `cors`, `helmet`, `express-rate-limit`, `@prisma/client`, `prisma`, `bcrypt`, `jsonwebtoken`, `multer`, `sharp`, `exceljs`, `nodemailer`, `joi` (validation), `morgan`, `dotenv`, `slugify`
- Dev deps: `nodemon`, `eslint`, `prettier`

---

### Phase 2 — Database & Backend Core

#### [NEW] `server/prisma/schema.prisma`

Full Prisma schema with these models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id           Int       @id @default(autoincrement())
  name         String
  email        String    @unique
  passwordHash String
  role         String    @default("admin") // admin | superadmin
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  bulkImports  BulkImportLog[]
}

model Category {
  id        Int        @id @default(autoincrement())
  name      String
  slug      String     @unique
  parentId  Int?
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryTree")
  imageUrl  String?
  order     Int        @default(0)
  isActive  Boolean    @default(true)
  products  Product[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Product {
  id                   Int             @id @default(autoincrement())
  name                 String
  slug                 String          @unique
  sku                  String?         @unique
  categoryId           Int
  category             Category        @relation(fields: [categoryId], references: [id])
  materials            String?
  colors               Json?           // [{name: "Antique", hex: "#8B7355"}, ...]
  sizes                Json?           // [{label: "Default", dimensions: "..."}, ...]
  overview             String?         @db.Text
  keyFeatures          String?         @db.Text
  careMaintenance      String?         @db.Text
  warrantyInfo         String?         @db.Text
  returnExchangePolicy String?        @db.Text
  priceDisplay         String?         // "৳ 15,000" or "Price on Request" or null to hide
  isFeatured           Boolean         @default(false)
  isActive             Boolean         @default(true)
  metaTitle            String?
  metaDescription      String?
  images               ProductImage[]
  variants             ProductVariant[]
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt
}

model ProductImage {
  id        Int     @id @default(autoincrement())
  productId Int
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  thumbUrl  String? // Generated thumbnail
  altText   String?
  isPrimary Boolean @default(false)
  order     Int     @default(0)
}

model ProductVariant {
  id          Int     @id @default(autoincrement())
  productId   Int
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  colorName   String?
  colorHex    String?
  swatchImage String?
  sizeLabel   String?
  order       Int     @default(0)
}

model ContactLead {
  id              Int      @id @default(autoincrement())
  name            String
  email           String
  phone           String?
  referenceNumber String?
  message         String   @db.Text
  source          String   @default("contact-form") // contact-form | faq-form
  category        String?  // FAQ category for faq-form submissions
  status          String   @default("new") // new | seen | resolved
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Store {
  id       Int     @id @default(autoincrement())
  name     String
  address  String
  phone    String?
  email    String?
  imageUrl String?
  mapUrl   String? // Google Maps embed URL or "Get Directions" link
  lat      Float?
  lng      Float?
  order    Int     @default(0)
  isActive Boolean @default(true)
}

model JobPost {
  id               Int      @id @default(autoincrement())
  title            String
  department       String?
  location         String?
  type             String   @default("full-time") // full-time | part-time | contract
  description      String   @db.Text
  requirements     String?  @db.Text
  applyInstructions String? @db.Text
  isActive         Boolean  @default(true)
  postedAt         DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model ContentBlock {
  id      Int    @id @default(autoincrement())
  page    String // terms | privacy | shipping | returns | license | about
  section String // e.g. "hero", "mission", "vision", "team"
  title   String?
  body    String @db.Text
  order   Int    @default(0)
}

model FaqItem {
  id        Int    @id @default(autoincrement())
  groupName String // "How To Inquire", "Exchanges & Returns", "Refund Questions"
  question  String
  answer    String @db.Text
  order     Int    @default(0)
}

model HeroSlide {
  id       Int     @id @default(autoincrement())
  imageUrl String
  title    String?
  subtitle String?
  ctaText  String?
  ctaLink  String?
  order    Int     @default(0)
  isActive Boolean @default(true)
}

model TrustBadge {
  id          Int    @id @default(autoincrement())
  icon        String // icon identifier (e.g. "delivery", "returns", "support", "discounts")
  title       String
  description String
  order       Int    @default(0)
}

model TeamMember {
  id       Int    @id @default(autoincrement())
  name     String
  title    String
  imageUrl String?
  order    Int    @default(0)
}

model BulkImportLog {
  id           Int      @id @default(autoincrement())
  adminId      Int
  admin        Admin    @relation(fields: [adminId], references: [id])
  fileName     String
  totalRows    Int
  successCount Int      @default(0)
  failCount    Int      @default(0)
  errorReport  Json?
  status       String   @default("pending") // pending | processing | completed | failed
  createdAt    DateTime @default(now())
}

model SiteSetting {
  id    Int    @id @default(autoincrement())
  key   String @unique
  value String @db.Text
}
```

**Additional models added vs. spec**: `TrustBadge` (to make trust badges admin-editable as requested), `TeamMember` (for "Meet Our Teams" on About page), `SiteSetting` (for site-wide config like company name, address, social links).

#### [NEW] `server/prisma/seed.js`
- Seeds: 7 default categories (Office, Living, Dining, Bed Room, Kids Room, Industrial, Hospital)
- 20+ sample products with images (placeholder URLs)
- 2 sample stores (Talukder Furniture Dhaka, Talukder Furniture Factory Jashore)
- Default FAQ items (3 groups, ~12 items)
- Default trust badges (4 items)
- 3 hero slides
- Default content blocks for Terms/Privacy/Shipping/Returns/License/About pages
- Seeded admin account (from ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD env vars)
- 3 team members
- Sample job posts

#### Backend Architecture (Express)

##### Routes & Controllers

| Resource | Endpoints | Auth |
|----------|-----------|------|
| **Auth** | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout` | Public |
| **Products** | `GET /api/products` (paginated, filterable), `GET /api/products/:slug`, `GET /api/products/search?q=` | Public |
| **Products (admin)** | `POST /api/admin/products`, `PUT /api/admin/products/:id`, `DELETE /api/admin/products/:id` | JWT |
| **Product Images** | `POST /api/admin/products/:id/images` (multer), `PUT /api/admin/products/:id/images/reorder`, `DELETE /api/admin/images/:id` | JWT |
| **Categories** | `GET /api/categories` (with tree), `GET /api/categories/:slug/products` | Public |
| **Categories (admin)** | `POST/PUT/DELETE /api/admin/categories/:id` | JWT |
| **Stores** | `GET /api/stores` | Public |
| **Stores (admin)** | `POST/PUT/DELETE /api/admin/stores/:id` | JWT |
| **Jobs** | `GET /api/jobs` | Public |
| **Jobs (admin)** | `POST/PUT/DELETE /api/admin/jobs/:id` | JWT |
| **Leads** | `POST /api/leads` (public form submission) | Public |
| **Leads (admin)** | `GET /api/admin/leads` (paginated, filterable), `PATCH /api/admin/leads/:id/status`, `GET /api/admin/leads/export` (CSV) | JWT |
| **FAQs** | `GET /api/faqs` (grouped) | Public |
| **FAQs (admin)** | `POST/PUT/DELETE /api/admin/faqs/:id`, `PUT /api/admin/faqs/reorder` | JWT |
| **Hero Slides** | `GET /api/hero-slides` | Public |
| **Hero Slides (admin)** | `POST/PUT/DELETE /api/admin/hero-slides/:id` | JWT |
| **Trust Badges** | `GET /api/trust-badges` | Public |
| **Trust Badges (admin)** | `PUT /api/admin/trust-badges/:id` | JWT |
| **Content Blocks** | `GET /api/content/:page` | Public |
| **Content Blocks (admin)** | `PUT /api/admin/content/:id` | JWT |
| **Team Members (admin)** | `POST/PUT/DELETE /api/admin/team-members/:id` | JWT |
| **Bulk Import** | `POST /api/admin/bulk-import/upload`, `GET /api/admin/bulk-import/template`, `GET /api/admin/bulk-import/logs` | JWT |
| **Dashboard** | `GET /api/admin/dashboard` (counts + recent leads) | JWT |
| **Sitemap** | `GET /sitemap.xml` | Public |
| **Upload** | `POST /api/admin/upload` (general image upload for content blocks, etc.) | JWT |

##### [NEW] Middleware

| Middleware | Purpose |
|-----------|---------|
| `authMiddleware.js` | JWT verification, attaches `req.admin` |
| `uploadMiddleware.js` | Multer config (memory storage → sharp resize → disk/S3), file type validation |
| `errorHandler.js` | Centralized error response formatting |
| `rateLimiter.js` | Express rate limiting per config |
| `validateRequest.js` | Generic Joi/Zod validation middleware factory |

##### [NEW] Services Layer

| Service | Responsibilities |
|---------|-----------------|
| `authService.js` | Login, token generation/verification, password hashing |
| `productService.js` | Product CRUD, search, filtering, pagination, slug generation |
| `imageService.js` | Upload via multer, resize/compress via sharp, thumbnail generation, S3 or local storage |
| `categoryService.js` | Category tree building, CRUD, reordering |
| `leadService.js` | Lead creation, status updates, CSV export |
| `bulkImportService.js` | Excel parsing (exceljs), row validation, transactional upsert, error report generation |
| `emailService.js` | Nodemailer SMTP setup, send lead notification to admin (graceful skip if no SMTP config) |
| `sitemapService.js` | Generate sitemap.xml from products/categories/static pages |
| `contentService.js` | Content block CRUD for static pages |

---

### Phase 3 — Public Frontend: Layout & Homepage

#### [NEW] Global Layout Components

##### `components/layout/Header.jsx`
- **Logo** (left): Talukder Furniture logo with link to `/`
- **Mega-menu nav** (center): Office Furniture, Living Room, Dining Room, Bedroom Collection, Institutional Furniture, Other Furniture, Kids Collection — each with dropdown chevron, showing subcategories on hover
- **"Pages" dropdown**: About Us, Contact, FAQs, Store List, Career, Terms of Use, Privacy Policy
- **Right icons**: Search (magnifying glass icon — opens `SearchOverlay`), Wishlist (heart icon with item count badge)
- **Sticky on scroll**: Becomes fixed with subtle shadow after scrolling past hero
- **Mobile**: Hamburger menu → slide-in drawer with accordion nav

##### `components/layout/Footer.jsx`
- Dark near-black (`#1a1a1a`) background
- 3-column layout:
  - **"Talukder Furniture"**: Address, phone (clickable `tel:`), email (clickable `mailto:`), social icons row (Facebook, X/Twitter, Instagram, Telegram)
  - **"Customer Services"**: Shipping, Return & Refund, Privacy Policy, Contact us — all linked
  - **"Information"**: About Us, Our Stores, License & Certificates, Career — all linked
- Bottom bar: `Copyright ©2026 Talukder. All Rights Reserved.` + scroll-to-top button (bottom-right)

##### `components/layout/PageBanner.jsx`
- Reusable warm taupe/grey gradient banner with page title + breadcrumb
- Used on Shop, About, Contact, FAQ, Store List, Wishlist, Career, Terms, etc.

##### `components/layout/Breadcrumb.jsx`
- `Homepage > [Parent] > Current Page` format with links

#### [NEW] Zustand Stores

##### `stores/useWishlistStore.js`
- State: `items` (array of product IDs), persisted to `localStorage`
- Actions: `addItem(productId)`, `removeItem(productId)`, `isInWishlist(productId)`, `clearWishlist()`
- Middleware: `persist` from zustand/middleware

##### `stores/useSearchStore.js`
- State: `isOpen`, `query`, `results`, `isLoading`
- Actions: `openSearch()`, `closeSearch()`, `setQuery()`, `search()` (debounced API call)

##### `stores/useAuthStore.js`
- State: `admin`, `token`, `isAuthenticated`
- Actions: `login()`, `logout()`, `refreshToken()`

##### `stores/useUIStore.js`
- State: `isMobileMenuOpen`, `isScrolled`
- Actions: `toggleMobileMenu()`, `setScrolled()`

#### [NEW] Homepage (`pages/public/HomePage.jsx`)

Structured exactly per the reference screenshot, top-to-bottom:

1. **Hero Carousel** — Full-width 3-slide layout with side-peek slides (previous/next visible at edges). Uses `Swiper` with `centeredSlides`, `slidesPerView: 1.2-1.4`, autoplay. Each slide: background image, overlay text (title, subtitle), "Explore Collection →" CTA button. Dark semi-transparent overlay on text area.

2. **Category Quick-Links Grid** — Circular/oval image thumbnails with category names below. 2 rows: (Office Furniture, Living Furniture) then (Dining Room, Bed Room, Kids Room) then (Industrial Furniture, Hospital Furniture). Each links to `/shop?category=slug`.

3. **"Our Picks For You" Product Grid** — Serif heading "Our Picks For You", subtitle "Fresh styles just in! Elevate your look". 2 rows × 4 columns of `ProductCard` components showing featured products. Each card: product image, title, price line.

4. **Curated Spaces Banner** — Split layout: left large image (sofa in room setting), right side has heading "Start With These Curated Spaces" + subtitle + a mini product card (High Back Chair, ৳ 0.00) with dot pagination.

5. **"Our Exclusive Bedroom Set" Carousel** — Serif heading, subtitle, "View All Products" link. Horizontal carousel (Swiper, 4 visible, with prev/next arrow buttons). Product cards with image, "Bedroom Set", price.

6. **Category Icon Strip** — Horizontal scrolling strip of category icons + labels (Shoe Rack, TV Cabinet, Book Shelves, Bedroom Set, Reading Table, etc.). Subtle infinite scroll or swipeable.

7. **"Discover Our Signature Interior Collections" CTA Block** — Dark background (#1a1a1a or similar), white text. Heading + description paragraph. Then 4 rows, each: collection name (e.g. "Talukder Prestige Collection", "Cozy Sofa Collection", "Dining Elegance Collection", "Comfortable Bedroom Collection") + "View More →" button, separated by thin lines.

8. **Trust Badges Strip** — 4-column grid: each with an icon, bold title, description subtitle. (Free & fast delivery, 14-Day Returns, 24/7 Support, Member Discounts). Data from `TrustBadge` model (admin-editable).

#### [NEW] Shared Components

##### `components/product/ProductCard.jsx`
- Product image (lazy loaded), title, price/priceDisplay line
- Subtle hover: slight scale up, shadow increase
- Heart icon (top-right or overlay) for wishlist toggle
- Links to `/products/:slug`

##### `components/common/TrustBadges.jsx`
- Fetches trust badges from API, renders 4-column icon grid
- Reused on Homepage, About Us, Store List pages

##### `components/common/SearchOverlay.jsx`
- Full-screen modal overlay triggered from header search icon
- Search input with magnifying glass icon
- Live search-as-you-type (debounced 300ms)
- Results grid: 4-column product cards
- Grouped by category if results span multiple
- "Load more" button for pagination
- Close button (X) top-right

##### `components/common/ScrollToTop.jsx`
- Fixed bottom-right button, appears after scrolling 300px
- Smooth scroll to top on click

---

### Phase 4 — Public Frontend: Catalog & Product Detail

#### [NEW] `pages/public/ShopPage.jsx`
- **Page banner**: "Shop" with breadcrumb `Homepage > Shop`
- **Filter bar**: Left: category filter checkbox or "Shop sale items only" checkbox (repurposed as category pills/dropdown). Center: grid-view toggle (3/4/5 columns — icons from reference). Right: "Sort by" dropdown (Default, Name A-Z, Name Z-A, Newest, Oldest)
- **Product grid**: Responsive grid showing `ProductCard` components. Default 4 columns on desktop.
- **Pagination**: Numbered pages (1, 2, ...) + next arrow. 20 items per page.
- **URL params**: `?category=slug&sort=name-asc&page=2&columns=4` — all state reflected in URL for SEO/shareability

#### [NEW] `pages/public/ProductDetailPage.jsx`
- **Breadcrumb**: `Homepage > [Category Name] > [Product Name]`
- **Layout**: Two-column on desktop
  - **Left**: Image gallery — vertical thumbnail stack (left edge) + large main image. Clicking thumbnail swaps main. Lightbox on main image click.
  - **Right**: Product info:
    - Product name (large serif heading)
    - Price display line (or "Price on Request")
    - **Materials** label + description
    - **Colors**: label + circular color swatches (clickable, highlights active)
    - **Size**: label + pill/tag buttons (e.g. "Default")
    - Estimated delivery note: "Please contact our nearest showrooms"
    - Return note: "Return within 45 days..." (admin-editable per product)
- **5-Tab Info Section** below: `Product Overview | Key Features | Care & Maintenance | Warranty Info | Return & Exchange Policy` — horizontal tab bar, content panel below each tab. Content is rich text (HTML from admin).
- **Related Products**: "Related Products" heading (serif, underlined), 4-column grid of same-category products.
- **SEO**: `<Helmet>` with product-specific title, description, OG tags, JSON-LD `Product` schema.

#### [MODIFY] `components/product/ProductCard.jsx`
- Add wishlist heart icon toggle (filled red when in wishlist, outline when not)
- Clicking heart calls `useWishlistStore.addItem/removeItem`

#### [NEW] `pages/public/WishlistPage.jsx`
- **Page banner**: "Wish List" with breadcrumb
- **If empty**: "Your Wishlist is Empty" heading
- **If has items**: Grid of wishlist product cards (fetched by IDs stored in Zustand/localStorage)
- **"You may be interested in..."** section below: 4 random/featured products as recommendations
- Remove item button on each wishlist card

---

### Phase 5 — Public Frontend: Content Pages

#### [NEW] `pages/public/AboutPage.jsx`
Per reference screenshot:
1. Page banner: "About Us", breadcrumb `Homepage > Pages > About Us`
2. "We Are Talukder" section: serif heading, centered paragraph about the company history
3. Large feature image (bedroom furniture display)
4. Two-column: "Our Mission" + "Our Vision" blocks with body text
5. Trust badges strip (4 icons)
6. Image + "Excellent Design" block: left image, right side: heading + paragraph, then 3 items with icons: Form, Feel, Functionality (each with description)
7. "Meet Our Teams" section: heading + subtitle, 3 cards (photo placeholder, name, title)
8. Footer

#### [NEW] `pages/public/ContactPage.jsx`
Per reference screenshot:
1. Full-width Google Maps embed (iframe) at top
2. Two-column below:
   - **Left**: "Dhaka" heading, Phone (clickable), Email (clickable), Address, Open Time (Sat - Thu: 9:00am - 6:00pm)
   - **Right**: "Get In Touch" heading, subtitle, form: Your Name, Your Email, Phone, Order Numbers (reference number), Your Message, "Send Message →" button
3. Form submits to `POST /api/leads` with `source: "contact-form"`

#### [NEW] `pages/public/FaqPage.jsx`
Per reference screenshot:
1. Page banner: "Faqs", breadcrumb
2. **Two-column layout**:
   - **Left (wider)**: FAQ accordion groups. Each group has a heading (e.g. "How To Buy", "Exchanges & Returns", "Refund Questions"). Under each: clickable question rows with chevron, expand to show answer.
   - **Right (sidebar)**: "Ask Your Question" card with: Name input, "How can we help you?" dropdown (category selector), Message textarea, "Send Request →" button. Submits to `POST /api/leads` with `source: "faq-form"`.

#### [NEW] `pages/public/StoreListPage.jsx`
Per reference screenshot:
1. Page banner: "Store List", breadcrumb
2. Grid of store cards (2 or 3 columns). Each card:
   - Store image (placeholder/photo)
   - Store name (bold)
   - Address
   - Phone
   - Email
   - "Get Directions" link (opens Google Maps in new tab)
3. Trust badges strip below
4. Footer

#### [NEW] `pages/public/CareerPage.jsx`
1. Page banner: "Career", breadcrumb
2. List of open job posts. Each:
   - Title (bold heading)
   - Department, Location, Type badges
   - Description excerpt
   - "View Details" → expands or links to detail section
   - Apply instructions
3. "No open positions" state if none active

#### [NEW] `pages/public/StaticContentPage.jsx` (reusable)
Used for Terms of Use, Privacy Policy, Shipping, Return & Refund, License & Certificates.
Per reference screenshot:
1. Page banner with page title + breadcrumb
2. **Two-column layout**:
   - **Left sidebar (sticky)**: Table of contents with numbered section links (e.g. "1. Terms", "2. Limitations", etc.). Left border accent line.
   - **Right (main content)**: Heading + sections of rich text content. Section headings anchor-linked from ToC.
3. Content loaded from `ContentBlock` model for the respective page.

#### [NEW] `pages/public/NotFoundPage.jsx`
- 404 page with "Page Not Found" message
- Link back to homepage
- Optional: suggested products or search

---

### Phase 6 — Admin Panel

#### Admin Layout & Auth

##### [NEW] `pages/admin/AdminLayout.jsx`
- **Sidebar**: Dark sidebar with logo, navigation links:
  - Dashboard, Products, Categories, Stores, Job Posts, FAQs, Hero Slides, Trust Badges, Content Pages, Team Members, Leads, Settings
- **Top bar**: Admin name, logout button
- **Main content area**: Renders child routes
- Protected by `useAuthStore` — redirects to login if not authenticated

##### [NEW] `pages/admin/LoginPage.jsx`
- Centered login card: email, password, "Sign In" button
- JWT auth, stores token in `useAuthStore` (+ localStorage)

##### [NEW] `pages/admin/DashboardPage.jsx`
- Stats cards: Total Products, New Leads This Week, Active Job Posts, Total Categories
- Recent Leads table (last 10)
- Quick action buttons

#### Product Management

##### [NEW] `pages/admin/products/ProductListPage.jsx`
- Paginated table of products: name, SKU, category, status (active/inactive), featured badge, actions (edit/delete)
- Search bar, category filter
- "Add Product" button → navigates to create form
- Bulk actions: delete selected, toggle active

##### [NEW] `pages/admin/products/ProductFormPage.jsx`
- Used for both create and edit (detect by route param `:id`)
- **Form sections**:
  1. **Basic Info**: Name, SKU, Category (dropdown), Materials, Price Display
  2. **Images**: Drag-and-drop upload zone, image reordering (drag), set primary image, delete, alt text per image. Uses multer endpoint. Preview grid.
  3. **Variants**: Dynamic list of color/size variants. Each: color name, color hex (with picker), swatch image upload, size label. Add/remove rows.
  4. **Description Tabs** (5 tabs with rich text editor — TipTap):
     - Product Overview, Key Features, Care & Maintenance, Warranty Info, Return & Exchange Policy
  5. **SEO**: Meta title, Meta description, slug (auto-generated from name, editable)
  6. **Settings**: Is Featured toggle, Is Active toggle
- Save button → `POST` or `PUT` to API

#### Bulk Import/Export

##### [NEW] `pages/admin/products/BulkImportPage.jsx`
1. **Download Template** button: fetches `.xlsx` template from `GET /api/admin/bulk-import/template`
2. **Upload Section**: Drag-and-drop `.xlsx` file upload
3. **Preview/Diff Table**: After upload, server parses and returns preview data. Shows each row with validation status (✓ valid, ✗ error with message). Columns: name, sku, category, materials, status.
4. **Commit Button**: Sends confirmed data to `POST /api/admin/bulk-import/commit`. Shows progress.
5. **Results**: Success/fail counts, downloadable error report for failed rows.
6. **Import History**: Table of past imports from `BulkImportLog`.

#### Other CRUD Pages

| Page | Features |
|------|----------|
| `pages/admin/categories/` | Tree view with drag-reorder, image upload, create/edit/delete modal |
| `pages/admin/stores/` | Table + create/edit form, image upload, map URL |
| `pages/admin/jobs/` | Table + create/edit form, rich text description |
| `pages/admin/faqs/` | Grouped list, drag-reorder within groups, add/edit/delete, group management |
| `pages/admin/hero-slides/` | Ordered list, image upload, title/subtitle/CTA fields, active toggle |
| `pages/admin/trust-badges/` | Edit form for each of the 4 badges (icon selector, title, description) |
| `pages/admin/content/` | Page selector → section list → rich text editor per section |
| `pages/admin/team-members/` | Table + create/edit form, image upload |

#### Leads Management

##### [NEW] `pages/admin/leads/LeadsPage.jsx`
- Tabbed or filtered table: All / New / Seen / Resolved
- Source filter: Contact Form / FAQ Form
- Each row: name, email, phone, message preview, source, status, date
- Click → detail view/modal with full message
- Status actions: Mark as Seen, Mark as Resolved
- "Export CSV" button → downloads all leads (or filtered) as CSV

---

### Phase 7 — SEO Pass

#### [MODIFY] All public page components
- Add `<Helmet>` with page-specific `<title>`, `<meta name="description">`, canonical URL, OG tags (og:title, og:description, og:image, og:url), Twitter card tags

#### [NEW] Product Detail JSON-LD
- `schema.org/Product` structured data on `/products/:slug`
- Includes: name, description, image, sku, brand ("Talukder Furniture"), category

#### [NEW] `server/src/services/sitemapService.js`
- Generates `sitemap.xml` from:
  - Static pages: /, /about, /contact, /faqs, /stores, /career, /terms, /privacy, /shipping, /returns, /license
  - Dynamic: `/products/:slug` for all active products, `/shop?category=:slug` for all categories
- Regenerated on product/category create/update/delete (or cached with TTL)
- Served at `GET /sitemap.xml`

#### [NEW] `client/public/robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://talukder-furniture.com/sitemap.xml
Disallow: /admin/
```

#### Slug System
- Products: `/products/:slug` (e.g. `/products/md-director-table`)
- Categories: `/shop/:categorySlug` or `/shop?category=:slug`
- Fallback: `/products/:id` redirects to `/products/:slug` (301) for back-compat

#### Prerendering / SSR Decision
- Implement using `vite-plugin-ssr` or a custom Express SSR middleware that calls `renderToPipeableStream` for the initial HTML shell
- This ensures crawlers get fully-rendered HTML with correct `<head>` tags
- If SSR proves too complex for this stack, fall back to `vite-plugin-prerender` for static-page prerendering of key routes

---

### Phase 8 — Polish & QA

#### Responsive Design
- **Breakpoints**: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- **Mobile nav**: Hamburger icon → slide-in drawer with accordion category nav
- **Product grids**: 1 col mobile, 2 col tablet, 3-4 col desktop
- **Hero carousel**: Full-width single slide on mobile (no side-peek)
- **Footer**: Stacked columns on mobile with collapsible sections
- **Admin**: Responsive sidebar (collapsible on tablet, drawer on mobile)

#### Loading / Empty / Error States
- Skeleton loaders for product grids, image galleries
- "Your Wishlist is Empty" with recommendation grid (per reference)
- "No products found" for empty search/filter results
- "No open positions" for Career page
- Toast notifications for form submissions, admin actions
- Error boundaries with fallback UI

#### Form Validation
- **Contact form**: Name (required), Email (required, valid format), Phone, Message (required)
- **FAQ ask form**: Name (required), Category (required), Message (required)
- **Admin forms**: All required fields enforced, SKU uniqueness, slug uniqueness
- Client-side (real-time) + server-side (Joi/Zod) validation

#### Backend Tests
- Unit tests for: auth service (login, token verify), product CRUD, category tree, lead creation, bulk import parsing
- Integration tests for key API endpoints
- Test framework: Jest or Vitest

#### Production Notes
- Build scripts: `npm run build` (both client + server)
- Environment variable documentation
- Docker optional: `Dockerfile` + `docker-compose.yml` for Postgres + app
- PM2 config for production Node.js process management

---

## Verification Plan

### Automated Tests
```bash
# Backend unit/integration tests
cd server && npm test

# Build verification
cd client && npm run build   # Ensure no build errors
cd server && npm run build   # If using TypeScript
```

### Manual Verification
- **Visual comparison**: Side-by-side screenshots vs reference for each page
- **Navigation**: Click through all nav links, breadcrumbs, footer links
- **Product flow**: Browse shop → filter by category → click product → view gallery → add to wishlist → go to wishlist
- **Search**: Open search overlay → type query → see results → click result
- **Forms**: Submit contact form, FAQ question form → verify leads appear in admin
- **Admin panel**: Login → CRUD products with images → bulk import → manage leads → edit content blocks
- **SEO**: View page source for meta tags, check /sitemap.xml, validate JSON-LD with Google's Rich Results Test
- **Responsive**: Test on Chrome DevTools at 375px (mobile), 768px (tablet), 1280px (desktop)
- **Performance**: Lighthouse audit for each key page
