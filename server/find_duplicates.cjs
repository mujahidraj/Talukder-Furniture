const XLSX = require('xlsx');
const path = require('path');

const filePath = 'c:\\Users\\user\\Desktop\\Talukder Furniture\\Documents\\home funiture.xlsx';
console.log('Reading file:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  // Data rows start from row index 4 (5th line)
  const dataRows = allRows.slice(4);
  console.log('Total data rows:', dataRows.length);

  const skuMap = {}; // sku -> array of { rowNum, name }
  const duplicateSkus = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 5; // 1-indexed plus 4 header rows
    const productCode = row[1]?.toString().trim();
    const productName = row[2]?.toString().trim();

    if (!productCode && !productName) {
      continue; // empty row
    }

    if (productCode) {
      if (!skuMap[productCode]) {
        skuMap[productCode] = [];
      }
      skuMap[productCode].push({ row: rowNum, name: productName });
    }
  }

  // Find duplicates
  for (const [sku, occurrences] of Object.entries(skuMap)) {
    if (occurrences.length > 1) {
      duplicateSkus.push({ sku, occurrences });
    }
  }

  console.log('=== DUPLICATE PRODUCT CODES FOUND ===');
  console.log('Number of unique SKUs with duplicates:', duplicateSkus.length);
  
  let totalDuplicatedEntries = 0;
  duplicateSkus.forEach(({ sku, occurrences }) => {
    totalDuplicatedEntries += (occurrences.length - 1);
    console.log(`\nProduct Code: "${sku}" (Found ${occurrences.length} times):`);
    occurrences.forEach(occ => {
      console.log(`  - Row ${occ.row}: Name: "${occ.name}"`);
    });
  });

  console.log(`\nSummary: Found ${duplicateSkus.length} product codes that appear multiple times, causing a total of ${totalDuplicatedEntries} duplicate records to be overwritten/skipped during upsert.`);
} catch (err) {
  console.error('Error running script:', err);
}
