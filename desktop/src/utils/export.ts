import { InventoryItem } from '@/types/inventory';

export const exportToCSV = (items: InventoryItem[]): void => {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Price',
    'Condition',
    'Category',
    'Status',
    'Platforms',
    'Created At',
    'Updated At',
  ];

  const rows = items.map((item) => [
    item.id,
    item.title,
    item.description.replace(/,/g, ';'), // Replace commas in description
    item.price.toString(),
    item.condition,
    item.category,
    item.status,
    item.platforms.join(';'),
    new Date(item.createdAt).toISOString(),
    new Date(item.updatedAt).toISOString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (items: InventoryItem[]): void => {
  const jsonContent = JSON.stringify(items, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = async (items: InventoryItem[]): Promise<void> => {
  // For Excel export, we'll create a CSV that Excel can open
  // In a production app, you might want to use a library like xlsx
  exportToCSV(items);
};



