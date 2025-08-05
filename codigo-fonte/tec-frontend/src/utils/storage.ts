import { Client, Service, Product, Proposal } from '../types';

const STORAGE_KEYS = {
  CLIENTS: 'tecsolutions_clients',
  SERVICES: 'tecsolutions_services',
  PRODUCTS: 'tecsolutions_products',
  PROPOSALS: 'tecsolutions_proposals',
};

// Clients
export const getClients = (): Client[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return data ? JSON.parse(data) : [];
};

export const saveClient = (client: Client): void => {
  const clients = getClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const deleteClient = (id: string): void => {
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

// Services
export const getServices = (): Service[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
  return data ? JSON.parse(data) : [];
};

export const saveService = (service: Service): void => {
  const services = getServices();
  const existingIndex = services.findIndex(s => s.id === service.id);
  
  if (existingIndex >= 0) {
    services[existingIndex] = service;
  } else {
    services.push(service);
  }
  
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
};

export const deleteService = (id: string): void => {
  const services = getServices().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
};

// Products
export const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

// Proposals
export const getProposals = (): Proposal[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
  return data ? JSON.parse(data) : [];
};

export const saveProposal = (proposal: Proposal): void => {
  const proposals = getProposals();
  const existingIndex = proposals.findIndex(p => p.id === proposal.id);
  
  if (existingIndex >= 0) {
    proposals[existingIndex] = proposal;
  } else {
    proposals.push(proposal);
  }
  
  localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
};

export const deleteProposal = (id: string): void => {
  const proposals = getProposals().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
};

// Initialize with mock data if empty
export const initializeStorage = (): void => {
  if (getClients().length === 0) {
    const mockClients = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        phone: '(11) 99999-9999',
        company: 'Empresa ABC Ltda',
        cnpj: '12.345.678/0001-90',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@comercio.com',
        phone: '(11) 88888-8888',
        company: 'Comércio XYZ',
        cnpj: '98.765.432/0001-10',
        address: 'Av. Paulista, 456 - São Paulo, SP',
        createdAt: new Date('2024-01-20'),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(mockClients));
  }

  if (getServices().length === 0) {
    const mockServices = [
      {
        id: '1',
        name: 'Configuração de Servidor',
        description: 'Instalação e configuração completa de servidor Windows/Linux',
        price: 800,
        category: 'infraestrutura',
        unit: 'unidade',
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '2',
        name: 'Suporte Técnico Premium',
        description: 'Suporte técnico 24/7 com atendimento prioritário',
        price: 150,
        category: 'helpdesk',
        unit: 'mês',
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '3',
        name: 'Backup em Nuvem',
        description: 'Solução de backup automatizado em nuvem com criptografia',
        price: 200,
        category: 'backup',
        unit: 'TB/mês',
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '4',
        name: 'Migração para AWS',
        description: 'Migração completa de infraestrutura para Amazon Web Services',
        price: 2500,
        category: 'nuvem',
        unit: 'projeto',
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '5',
        name: 'Cabeamento Estruturado',
        description: 'Instalação de rede estruturada com certificação',
        price: 80,
        category: 'cabeamento',
        unit: 'ponto',
        createdAt: new Date('2024-01-10'),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(mockServices));
  }

  if (getProducts().length === 0) {
    const mockProducts = [
      {
        id: '1',
        name: 'Cabo de Rede Cat6 UTP',
        description: 'Cabo de rede categoria 6 UTP 4 pares 24AWG',
        price: 2.50,
        category: 'cabos',
        unit: 'metro',
        brand: 'Furukawa',
        model: 'Cat6 UTP',
        stock: 1000,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '2',
        name: 'Conector RJ45 Cat6',
        description: 'Conector RJ45 categoria 6 para cabo UTP',
        price: 0.80,
        category: 'conectores',
        unit: 'unidade',
        brand: 'Panduit',
        model: 'CJ688TGBU',
        stock: 500,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '3',
        name: 'Power Balun Passivo',
        description: 'Balun passivo para transmissão de vídeo e energia via UTP',
        price: 25.00,
        category: 'equipamentos',
        unit: 'par',
        brand: 'Intelbras',
        model: 'VB 1001 P',
        stock: 50,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '4',
        name: 'Patch Panel 24 Portas',
        description: 'Patch panel 24 portas categoria 6 19 polegadas',
        price: 120.00,
        category: 'equipamentos',
        unit: 'unidade',
        brand: 'Furukawa',
        model: 'PP24C6',
        stock: 20,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '5',
        name: 'Abraçadeira Plástica',
        description: 'Abraçadeira plástica para fixação de cabos',
        price: 0.15,
        category: 'acessorios',
        unit: 'unidade',
        brand: 'Hellermann',
        model: 'T50R',
        stock: 2000,
        createdAt: new Date('2024-01-10'),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockProducts));
  }
};