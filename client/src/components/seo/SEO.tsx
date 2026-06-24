import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: 'website' | 'article' | 'product';
  name?: string;
  image?: string;
  url?: string;
  schema?: Record<string, any>;
}

export default function SEO({
  title,
  description,
  type = 'website',
  name = 'Talukder Furniture',
  image = 'https://talukder-furniture.com/og-image.jpg', // Placeholder
  url = 'https://talukder-furniture.com',
  schema
}: SEOProps) {

  const siteTitle = title ? `${title} | ${name}` : `${name} - Premium Craftsmanship for Your Home`;
  const siteDescription = description || "Discover our meticulously crafted furniture collections. Talukder Furniture brings timeless elegance and uncompromising quality to your living spaces.";

  // Default Organization Schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": name,
    "image": image,
    "@id": url,
    "url": url,
    "telephone": "+8801966333355",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Talukder Group of Industries, House #21, Road #21,",
      "addressLocality": " Nikunja 2",
      "addressRegion": "Dhaka",
      "postalCode": "1229",
      "addressCountry": "Bangladesh"
    }
  };

  const finalSchema = schema || defaultSchema;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name='description' content={siteDescription} />

      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={name} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content="@talukderfurniture" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
}
