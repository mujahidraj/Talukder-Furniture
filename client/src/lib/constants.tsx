// Site info
export const SITE_NAME = 'Talukder Furniture';
export const SITE_TAGLINE = 'Quality Furniture for Every Space';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://talukder-furniture.com';

// Company info
export const COMPANY = {
  name: 'Talukder Group of Industries',
  address: 'House #21, Road #21, Nikunja 2, Dhaka-1229, Bangladesh',
  phone: '+880 1966-333355',
  email: 'info@talukder-group.com.bd',
  social: {
    facebook: 'https://www.facebook.com/share/1EDKxts4Nu/?mibextid=wwXIfr',
    twitter: 'https://twitter.com/talukderfurniture',
    instagram: 'https://www.instagram.com/talukder_plastic/',
    telegram: 'https://t.me/talukderfurniture',
  },
  openTime: 'Sat - Thu: 9:00am - 6:00pm',
};

// Navigation items
export const NAV_CATEGORIES = [
  { label: 'Office Furniture', slug: 'office' },
  { label: 'Living Room', slug: 'living-room' },
  { label: 'Dining Room', slug: 'dining-room' },
  { label: 'Bedroom', slug: 'bedroom' },
  { label: 'Institutional ', slug: 'institutional' },
  { label: 'Other Furniture', slug: 'other-furniture' },
  { label: 'Kids Collection', slug: 'kids-collection' },
];

export const NAV_PAGES = [
  { label: 'About Us', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'FAQs', path: '/faqs' },
  { label: 'Our Stores', path: '/stores' },
  { label: 'Career', path: '/career' },
  { label: 'Terms of Use', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' },
];

// Product grid options
export const GRID_COLUMNS = [3, 4, 5];
export const DEFAULT_GRID_COLUMNS = 4;
export const PRODUCTS_PER_PAGE = 20;

export const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

// Lead sources
export const LEAD_SOURCES = {
  CONTACT_FORM: 'contact-form',
  FAQ_FORM: 'faq-form',
};

// Lead statuses
export const LEAD_STATUSES = {
  NEW: 'new',
  SEEN: 'seen',
  RESOLVED: 'resolved',
};

// Google Maps
export const GOOGLE_MAPS_EMBED_URL =
  import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL ||
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.234!2d90.4186!3d23.8103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ4JzM3LjEiTiA5MMKwMjUnMDcuMCJF!5e0!3m2!1sen!2sbd!4v1';
