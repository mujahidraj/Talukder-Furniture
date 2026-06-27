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
  image = 'https://talukderfurniture.com/furniture_logo.jpg', // Default image
  url = 'https://talukderfurniture.com',
  schema
}: SEOProps) {

  // Force url to use talukderfurniture.com if they provided a relative path or old path
  const canonicalUrl = url.startsWith('http') ? url : `https://talukderfurniture.com${url.startsWith('/') ? '' : '/'}${url}`;

  const siteTitle = title ? `${title} | ${name}` : `${name} - Premium Craftsmanship for Your Home`;
  const siteDescription = description || "Discover our meticulously crafted furniture collections. Talukder Furniture brings timeless elegance and uncompromising quality to your living spaces.";

  // Default Organization Schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": name,
    "image": image,
    "@id": "https://talukderfurniture.com",
    "url": "https://talukderfurniture.com",
    "telephone": "+8801966333355",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Talukder Group of Industries, House #21, Road #21,",
      "addressLocality": " Nikunja 2",
      "addressRegion": "Dhaka",
      "postalCode": "1229",
      "addressCountry": "Bangladesh"
    },
    "sameAs": [
      "https://www.facebook.com/talukderfurniture",
      "https://www.instagram.com/talukderfurniture"
    ]
  };

  // If a specific page schema is provided (like Product), inject BOTH the store schema and the product schema.
  const finalSchema = schema ? [defaultSchema, schema] : defaultSchema;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name='description' content={siteDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
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
