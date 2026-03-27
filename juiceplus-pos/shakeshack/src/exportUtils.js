// exportUtils.js - Export products to GoDaddy CSV and JSON formats

export const exportToGoDaddyCSV = (products) => {
  const headers = [
    'SKU',
    'EAN',
    'UPC',
    'GTIN',
    'ISBN',
    'TYPE',
    'NAME',
    'PRODUCT ID',
    'VARIANT GROUP ID',
    'SHORTCODE',
    'MANUFACTURER',
    'MODEL NUMBER',
    'MSRP',
    'BRAND',
    'STATUS',
    'PRICE',
    'SALE PRICE',
    'UNIT COST',
    'ALLOW CUSTOM PRICE',
    'ON-HAND QUANTITY',
    'TRACK INVENTORY',
    'BACKORDER LIMIT',
    'DESCRIPTION',
    'FREE SHIPPING',
    'FIXED SHIPPING FEE',
    'WEIGHT',
    'LENGTH',
    'WIDTH',
    'HEIGHT',
    'IMAGE URL',
    'OPTION 1 NAME',
    'OPTION 1 VALUE',
    'OPTION 2 NAME',
    'OPTION 2 VALUE',
    'OPTION 3 NAME',
    'OPTION 3 VALUE',
  ];

  const rows = products.map((product) => {
    const baseSku = product.sku || generateSKU(product.name);
    const priceInCents = Math.round(product.price * 100);
    const costInCents = Math.round((product.cost || 0) * 100);

    return [
      baseSku,
      '',
      '',
      '',
      '',
      'PHYSICAL',
      escapeCSV(product.name),
      slugify(product.name),
      '',
      generateShortcode(product.name),
      'JuicePlus',
      '',
      '',
      'JuicePlus',
      product.status || 'ACTIVE',
      priceInCents,
      '',
      costInCents,
      'false',
      product.inventory || 0,
      'true',
      '',
      escapeCSV(product.description || ''),
      'false',
      '',
      product.weight || '',
      '',
      '',
      '',
      product.image_url || '',
      product.option_1_name || '',
      product.option_1_value || '',
      product.option_2_name || '',
      product.option_2_value || '',
      product.option_3_name || '',
      product.option_3_value || '',
    ];
  });

  const csv = [
    headers.map((h) => escapeCSV(h)).join(','),
    ...rows.map((row) =>
      row.map((cell) => (typeof cell === 'string' ? escapeCSV(cell) : cell)).join(',')
    ),
  ].join('\n');

  return csv;
};

export const exportToJSON = (products) => {
  return JSON.stringify(products, null, 2);
};

export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Helper functions
const escapeCSV = (str) => {
  if (!str) return '';
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const generateSKU = (name) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `JP-${slugify(name).toUpperCase().slice(0, 10)}-${timestamp}`;
};

const generateShortcode = (name) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 8);
};

export const formatDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};
