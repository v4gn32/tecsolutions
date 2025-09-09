const fs = require('fs');
const path = require('path');

// Read the current storage.ts file
const storagePath = path.join(__dirname, 'src', 'utils', 'storage.ts');
let content = fs.readFileSync(storagePath, 'utf8');

// Replace all remaining PostgreSQL functions with localStorage versions
const replacements = [
  // Delete service function
  {
    old: /export const deleteService = async \(id: string\): Promise<void> => {[\s\S]*?await query\('DELETE FROM services WHERE id = \$1', \[id\]\);[\s\S]*?};/,
    new: `export const deleteService = async (id: string): Promise<void> => {
  try {
    const services = getFromStorage<Service>(STORAGE_KEYS.SERVICES);
    const filteredServices = services.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.SERVICES, filteredServices);
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    throw error;
  }
};`
  },
  // Products functions
  {
    old: /\/\/ Products[\s\S]*?export const getProducts = async \(\): Promise<Product\[\]> => {[\s\S]*?};/,
    new: `// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const products = getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    return products.map(product => ({
      ...product,
      createdAt: new Date(product.createdAt)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};`
  }
];

// Apply replacements
replacements.forEach(replacement => {
  content = content.replace(replacement.old, replacement.new);
});

// Write back to file
fs.writeFileSync(storagePath, content, 'utf8');
console.log('Storage.ts updated successfully!');