import * as XLSX from 'xlsx';
import prisma from '../config/db.js';
import slugify from 'slugify';

// Color name → hex lookup for common furniture colors
const COLOR_HEX_MAP: Record<string, string> = {
  'antique': '#8B7355',
  'white': '#FFFFFF',
  'black': '#000000',
  'blue': '#3B82F6',
  'red': '#EF4444',
  'green': '#22C55E',
  'brown': '#8B4513',
  'dark brown': '#3E2723',
  'light brown': '#A1887F',
  'beige': '#F5F5DC',
  'grey': '#9E9E9E',
  'gray': '#9E9E9E',
  'cream': '#FFFDD0',
  'walnut': '#5C4033',
  'oak': '#C8A96E',
  'mahogany': '#4E0000',
  'teak': '#B99766',
  'natural': '#D2B48C',
  'lacquer finish': '#C4A35A',
  'lacquer': '#C4A35A',
  'cherry': '#660000',
  'ivory': '#FFFFF0',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  'off white': '#FAF9F6',
  'matte black': '#28282B',
  'rosewood': '#65000B',
  'pine': '#E8D4A2',
  'ash': '#B2BEB5',
  'wenge': '#645452',
};

function getColorHex(colorName: string): string {
  const key = colorName.trim().toLowerCase();
  return COLOR_HEX_MAP[key] || '#8B7355'; // Default to accent color
}

/**
 * Normalizes category names to help map variations like "Institutional Furniture" 
 * to an existing "Institutional" category.
 */
function normalizeCategoryName(name: string): string {
  if (!name) return name;
  let normalized = name.trim();
  // Remove common redundant suffixes case-insensitively
  normalized = normalized.replace(/\s+furnitures?$/i, '');
  normalized = normalized.replace(/\s+categories?$/i, '');
  return normalized.trim();
}

interface ImportResult {
  totalRows: number;
  successCount: number;
  failCount: number;
  skippedCount: number;
  logs: string[];
  errors: { row: number; error: string }[];
}

export const processExcelFile = async (fileBuffer: Buffer, adminId: number, fileName: string): Promise<ImportResult> => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Get all rows as arrays (header: 1 means arrays not objects)
  const allRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const result: ImportResult = {
    totalRows: 0,
    successCount: 0,
    failCount: 0,
    skippedCount: 0,
    logs: [],
    errors: [],
  };

  // Skip first 4 rows (Title, Subtitle, Main Headers, Sub Headers)
  const dataRows = allRows.slice(4);
  result.totalRows = dataRows.length;
  result.logs.push(`Found ${dataRows.length} data rows to process.`);

  // Group rows by productCode (or productName if no code)
  const groupedRows: Record<string, any[][]> = {};
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const productCode = row[1]?.toString().trim();
    const productName = row[2]?.toString().trim();
    
    // Skip empty rows
    if (!productCode && !productName) {
      result.skippedCount++;
      continue;
    }
    
    if (!productName) {
      result.errors.push({ row: i + 5, error: 'Missing product name' });
      result.failCount++;
      continue;
    }
    
    const key = productCode || productName;
    if (!groupedRows[key]) {
      groupedRows[key] = [];
    }
    groupedRows[key].push(row);
  }

  // Cache for categories to avoid redundant DB lookups
  const categoryCache: Map<string, number> = new Map();

  for (const [key, rowsGroup] of Object.entries(groupedRows)) {
    try {
      const firstRow = rowsGroup[0];
      const productCode = firstRow[1]?.toString().trim();
      const productName = firstRow[2]?.toString().trim();
      const materials = firstRow[4]?.toString().trim();
      const categoryMain = normalizeCategoryName(firstRow[5]?.toString());
      const categorySub = normalizeCategoryName(firstRow[6]?.toString());
      const description = firstRow[12]?.toString().trim();
      const careAndMaintenance = firstRow[13]?.toString().trim();
      const warrantyInfo = firstRow[14]?.toString().trim();

      // --- Category Resolution ---
      let categoryId: number;
      const cacheKey = `${categoryMain}__${categorySub}`;

      if (categoryCache.has(cacheKey)) {
        categoryId = categoryCache.get(cacheKey)!;
      } else {
        let parentCategory = null;
        if (categoryMain) {
          const mainSlug = slugify(categoryMain, { lower: true, strict: true });
          parentCategory = await prisma.category.upsert({
            where: { slug: mainSlug },
            update: {},
            create: { name: categoryMain, slug: mainSlug },
          });
        }

        if (categorySub) {
          const subSlug = slugify(categorySub, { lower: true, strict: true });
          const subCategory = await prisma.category.upsert({
            where: { slug: subSlug },
            update: {},
            create: {
              name: categorySub,
              slug: subSlug,
              parentId: parentCategory?.id || null,
            },
          });
          categoryId = subCategory.id;
        } else if (parentCategory) {
          categoryId = parentCategory.id;
        } else {
          const uncatSlug = 'uncategorized';
          const uncat = await prisma.category.upsert({
            where: { slug: uncatSlug },
            update: {},
            create: { name: 'Uncategorized', slug: uncatSlug },
          });
          categoryId = uncat.id;
        }
        categoryCache.set(cacheKey, categoryId);
      }

      // --- Sizes, Prices & Colors Processing from all grouped rows ---
      const sizes: any[] = [];
      const uniqueColors = new Set<string>();
      const colorsArray: any[] = [];
      
      let basePrice: number | null = null;
      let discountPercentage: number | null = null;

      rowsGroup.forEach((row, index) => {
        const measurement = row[7]?.toString().trim();
        const colorName = row[8]?.toString().trim();
        const mrp = row[10];
        const discountRaw = row[11];

        // Parse price for this specific row/variation
        let rowPrice: number | null = null;
        if (mrp !== undefined && mrp !== null && mrp !== '') {
          rowPrice = typeof mrp === 'number' ? mrp : parseFloat(mrp.toString().replace(/[^0-9.]/g, ''));
          if (isNaN(rowPrice)) rowPrice = null;
        }

        // Set base price from the first row
        if (index === 0) {
          basePrice = rowPrice;
          if (discountRaw !== undefined && discountRaw !== null && discountRaw !== '') {
            let rawVal = discountRaw;
            if (typeof rawVal === 'string') {
              rawVal = rawVal.replace('%', '').trim();
              discountPercentage = parseFloat(rawVal);
            } else if (typeof rawVal === 'number') {
              discountPercentage = rawVal < 1 ? rawVal * 100 : rawVal;
            }
            if (isNaN(discountPercentage!)) discountPercentage = null;
          }
        }

        if (measurement) {
          sizes.push({
            label: measurement,
            dimensions: measurement,
            price: rowPrice
          });
        }

        if (colorName && !uniqueColors.has(colorName)) {
          uniqueColors.add(colorName);
          colorsArray.push({ name: colorName, hex: getColorHex(colorName) });
        }
      });

      const finalColors = colorsArray.length > 0 ? colorsArray : null;
      const finalSizes = sizes.length > 0 ? sizes : null;

      // --- Slug ---
      const baseSlug = slugify(productName, { lower: true, strict: true });
      const slug = productCode ? `${baseSlug}-${slugify(productCode, { lower: true, strict: true })}` : baseSlug;

      // --- Upsert Product ---
      if (productCode) {
        // Find existing product to compare
        const existingProduct = await prisma.product.findUnique({
          where: { sku: productCode },
        });

        const newKeyFeatures = sizes.length > 0 ? sizes[0].dimensions : null;
        
        let hasChanged = true;
        
        if (existingProduct) {
          // Compare fields
          const isNameSame = existingProduct.name === productName;
          const isCategorySame = existingProduct.categoryId === categoryId;
          const isMaterialsSame = existingProduct.materials === (materials || null);
          const isOverviewSame = existingProduct.overview === (description || null);
          const isCareSame = existingProduct.careMaintenance === (careAndMaintenance || null);
          const isWarrantySame = existingProduct.warrantyInfo === (warrantyInfo || null);
          const isBasePriceSame = existingProduct.basePrice === basePrice;
          const isDiscountSame = existingProduct.discountPercentage === discountPercentage;
          const isKeyFeaturesSame = existingProduct.keyFeatures === newKeyFeatures;
          // Helper to ensure we have an array for JSON fields
          const parseJsonArray = (val: any) => {
            if (typeof val === 'string') {
              try { return JSON.parse(val); } catch (e) { return null; }
            }
            return val;
          };

          const existingColors = parseJsonArray(existingProduct.colors);
          const existingColorsStr = JSON.stringify((existingColors as any[])?.map(c => ({ name: c.name, hex: c.hex })) || null);
          const newColorsStr = JSON.stringify(finalColors?.map(c => ({ name: c.name, hex: c.hex })) || null);
          const isColorsSame = existingColorsStr === newColorsStr;
          
          const existingSizes = parseJsonArray(existingProduct.sizes);
          const existingSizesStr = JSON.stringify((existingSizes as any[])?.map(s => ({ label: s.label, dimensions: s.dimensions, price: s.price })) || null);
          const newSizesStr = JSON.stringify(finalSizes?.map(s => ({ label: s.label, dimensions: s.dimensions, price: s.price })) || null);
          const isSizesSame = existingSizesStr === newSizesStr;

          if (isNameSame && isCategorySame && isMaterialsSame && isOverviewSame && isCareSame && 
              isWarrantySame && isBasePriceSame && isDiscountSame && isKeyFeaturesSame && 
              isColorsSame && isSizesSame) {
            hasChanged = false;
          }
        }

        if (existingProduct && !hasChanged) {
          result.skippedCount += rowsGroup.length;
          // Skip the rest of the loop for this group
          continue;
        }

        await prisma.product.upsert({
          where: { sku: productCode },
          update: {
            name: productName,
            slug,
            categoryId,
            materials: materials || null,
            colors: finalColors ? finalColors : undefined, // Prisma Json handling
            sizes: finalSizes ? finalSizes : undefined,
            keyFeatures: newKeyFeatures,
            overview: description || null,
            careMaintenance: careAndMaintenance || null,
            warrantyInfo: warrantyInfo || null,
            basePrice,
            discountPercentage,
          },
          create: {
            name: productName,
            slug,
            sku: productCode,
            categoryId,
            materials: materials || null,
            colors: finalColors ? finalColors : undefined,
            sizes: finalSizes ? finalSizes : undefined,
            keyFeatures: newKeyFeatures,
            overview: description || null,
            careMaintenance: careAndMaintenance || null,
            warrantyInfo: warrantyInfo || null,
            basePrice,
            discountPercentage,
            isActive: true,
            isFeatured: false,
          },
        });
      } else {
        await prisma.product.create({
          data: {
            name: productName,
            slug: slug + '-' + Date.now(),
            categoryId,
            materials: materials || null,
            colors: finalColors ? finalColors : undefined,
            sizes: finalSizes ? finalSizes : undefined,
            keyFeatures: sizes.length > 0 ? sizes[0].dimensions : null,
            overview: description || null,
            careMaintenance: careAndMaintenance || null,
            warrantyInfo: warrantyInfo || null,
            basePrice,
            discountPercentage,
            isActive: true,
            isFeatured: false,
          },
        });
      }

      result.successCount += rowsGroup.length;
    } catch (err: any) {
      result.failCount += rowsGroup.length;
      result.errors.push({ row: 0, error: `Error processing group ${key}: ${err.message || 'Unknown error'}` });
    }
  }

  result.logs.push(`Import complete: ${result.successCount} success, ${result.failCount} failed, ${result.skippedCount} skipped.`);

  await prisma.bulkImportLog.create({
    data: {
      adminId,
      fileName,
      totalRows: result.totalRows,
      successCount: result.successCount,
      failCount: result.failCount,
      errorReport: result.errors as any,
      status: result.failCount > 0 ? (result.successCount > 0 ? 'completed' : 'failed') : 'completed',
    }
  });

  return result;
};

export const generateTemplate = (): Buffer => {
  const wb = XLSX.utils.book_new();

  // Build the template with the exact same structure as the user's catalog
  const templateData = [
    ['Talukder Furniture Ltd.'],
    ['Home Furniture Specifications'],
    ['SL No', 'Product Code', 'Product Name', 'Picture', 'Materials', 'Category', '', 'Measurement', 'Color', 'Price', '', '', 'Description', 'Care and Maintenance', 'Warranty Info'],
    ['', '', '', '', '', 'Main', 'Sub', '', '', 'DP', 'MRP', 'Discount', '', '', ''],
    // Example row
    [1, 'TFL-BED-001', 'Sample Double Bed', '', 'Melamine Face Chip Board & Imported Foreign Accessories', 'Home Furniture', 'Bedroom Furniture', 'Double-L 2225 x W 1582 x H 875 mm', 'Antique', '', 15600, '22%', 'Product description here.', 'Care instructions here.', 'Warranty details here.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths for readability
  ws['!cols'] = [
    { wch: 6 },   // SL No
    { wch: 18 },  // Product Code
    { wch: 25 },  // Product Name
    { wch: 10 },  // Picture
    { wch: 35 },  // Materials
    { wch: 18 },  // Category Main
    { wch: 22 },  // Category Sub
    { wch: 35 },  // Measurement
    { wch: 15 },  // Color
    { wch: 10 },  // DP (Dealer Price)
    { wch: 10 },  // MRP
    { wch: 10 },  // Discount
    { wch: 40 },  // Description
    { wch: 40 },  // Care and Maintenance
    { wch: 40 },  // Warranty Info
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
};
