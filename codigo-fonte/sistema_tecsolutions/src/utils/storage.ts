import { Client, Service, Product, Proposal, HardwareInventory, SoftwareInventory } from '../types';
import {
  getClientsFromSupabase,
  saveClientToSupabase,
  deleteClientFromSupabase,
  getServicesFromSupabase,
  saveServiceToSupabase,
  deleteServiceFromSupabase,
  getProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  getProposalsFromSupabase,
  saveProposalToSupabase,
  deleteProposalFromSupabase,
  getHardwareInventoryFromSupabase,
  saveHardwareInventoryToSupabase,
  deleteHardwareInventoryFromSupabase,
  getHardwareByClientFromSupabase,
  getSoftwareInventoryFromSupabase,
  saveSoftwareInventoryToSupabase,
  deleteSoftwareInventoryFromSupabase,
  getSoftwareByClientFromSupabase,
  getServiceRecordsFromSupabase,
  saveServiceRecordToSupabase,
  deleteServiceRecordFromSupabase,
  getServiceRecordsByClientFromSupabase
} from './supabaseStorage';

const STORAGE_KEYS = {
  CLIENTS: 'tecsolutions_clients',
  SERVICES: 'tecsolutions_services',
  PRODUCTS: 'tecsolutions_products',
  PROPOSALS: 'tecsolutions_proposals',
  HARDWARE_INVENTORY: 'tecsolutions_hardware_inventory',
  SOFTWARE_INVENTORY: 'tecsolutions_software_inventory',
};

// Check if we should use Supabase or localStorage
const useSupabase = () => {
  const hasSupabaseConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log('Verificando configuração Supabase:', {
    hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    useSupabase: hasSupabaseConfig
  });
  return hasSupabaseConfig;
};

// Clients
export const getClients = async (): Promise<Client[]> => {
  console.log('Carregando clientes...');
  
  if (useSupabase()) {
    console.log('Carregando do Supabase');
    return await getClientsFromSupabase();
  }
  
  console.log('Carregando do localStorage');
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  const clients = data ? JSON.parse(data) : [];
  console.log('Clientes carregados:', clients);
  return clients;
};

export const saveClient = async (client: Client): Promise<void> => {
  console.log('Tentando salvar cliente:', client);
  
  try {
    if (useSupabase()) {
      console.log('Usando Supabase para salvar cliente');
      return await saveClientToSupabase(client);
    }
    
    console.log('Usando localStorage para salvar cliente');
    const clients = await getClients();
    const existingIndex = clients.findIndex(c => c.id === client.id);
    
    if (existingIndex >= 0) {
      clients[existingIndex] = client;
      console.log('Cliente atualizado na posição:', existingIndex);
    } else {
      clients.push(client);
      console.log('Novo cliente adicionado. Total de clientes:', clients.length);
    }
    
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    console.log('Cliente salvo no localStorage com sucesso');
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    throw error;
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteClientFromSupabase(id);
  }
  
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

// Services
export const getServices = async (): Promise<Service[]> => {
  if (useSupabase()) {
    return await getServicesFromSupabase();
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
  return data ? JSON.parse(data) : [];
};

export const saveService = async (service: Service): Promise<void> => {
  if (useSupabase()) {
    return await saveServiceToSupabase(service);
  }
  
  const services = getServices();
  const existingIndex = services.findIndex(s => s.id === service.id);
  
  if (existingIndex >= 0) {
    services[existingIndex] = service;
  } else {
    services.push(service);
  }
  
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
};

export const deleteService = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteServiceFromSupabase(id);
  }
  
  const services = getServices().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  if (useSupabase()) {
    return await getProductsFromSupabase();
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const saveProduct = async (product: Product): Promise<void> => {
  if (useSupabase()) {
    return await saveProductToSupabase(product);
  }
  
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteProductFromSupabase(id);
  }
  
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

// Proposals
export const getProposals = async (): Promise<Proposal[]> => {
  if (useSupabase()) {
    return await getProposalsFromSupabase();
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
  return data ? JSON.parse(data) : [];
};

export const saveProposal = async (proposal: Proposal): Promise<void> => {
  if (useSupabase()) {
    return await saveProposalToSupabase(proposal);
  }
  
  const proposals = getProposals();
  const existingIndex = proposals.findIndex(p => p.id === proposal.id);
  
  if (existingIndex >= 0) {
    proposals[existingIndex] = proposal;
  } else {
    proposals.push(proposal);
  }
  
  localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
};

export const deleteProposal = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteProposalFromSupabase(id);
  }
  
  const proposals = getProposals().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
};

// Hardware Inventory
export const getHardwareInventory = async (): Promise<HardwareInventory[]> => {
  if (useSupabase()) {
    return await getHardwareInventoryFromSupabase();
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.HARDWARE_INVENTORY);
  return data ? JSON.parse(data) : [];
};

export const saveHardwareInventory = async (hardware: HardwareInventory): Promise<void> => {
  if (useSupabase()) {
    return await saveHardwareInventoryToSupabase(hardware);
  }
  
  const inventory = getHardwareInventory();
  const existingIndex = inventory.findIndex(h => h.id === hardware.id);
  
  if (existingIndex >= 0) {
    inventory[existingIndex] = hardware;
  } else {
    inventory.push(hardware);
  }
  
  localStorage.setItem(STORAGE_KEYS.HARDWARE_INVENTORY, JSON.stringify(inventory));
};

export const deleteHardwareInventory = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteHardwareInventoryFromSupabase(id);
  }
  
  const inventory = getHardwareInventory().filter(h => h.id !== id);
  localStorage.setItem(STORAGE_KEYS.HARDWARE_INVENTORY, JSON.stringify(inventory));
};

export const getHardwareByClient = async (clientId: string): Promise<HardwareInventory[]> => {
  if (useSupabase()) {
    return await getHardwareByClientFromSupabase(clientId);
  }
  
  return getHardwareInventory().filter(h => h.clientId === clientId);
};

// Software Inventory
export const getSoftwareInventory = async (): Promise<SoftwareInventory[]> => {
  if (useSupabase()) {
    return await getSoftwareInventoryFromSupabase();
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.SOFTWARE_INVENTORY);
  return data ? JSON.parse(data) : [];
};

export const saveSoftwareInventory = async (software: SoftwareInventory): Promise<void> => {
  if (useSupabase()) {
    return await saveSoftwareInventoryToSupabase(software);
  }
  
  const inventory = getSoftwareInventory();
  const existingIndex = inventory.findIndex(s => s.id === software.id);
  
  if (existingIndex >= 0) {
    inventory[existingIndex] = software;
  } else {
    inventory.push(software);
  }
  
  localStorage.setItem(STORAGE_KEYS.SOFTWARE_INVENTORY, JSON.stringify(inventory));
};

export const deleteSoftwareInventory = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteSoftwareInventoryFromSupabase(id);
  }
  
  const inventory = getSoftwareInventory().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SOFTWARE_INVENTORY, JSON.stringify(inventory));
};

export const getSoftwareByClient = async (clientId: string): Promise<SoftwareInventory[]> => {
  if (useSupabase()) {
    return await getSoftwareByClientFromSupabase(clientId);
  }
  
  return getSoftwareInventory().filter(s => s.clientId === clientId);
};

// Service Records
export const getServiceRecords = async (): Promise<ServiceRecord[]> => {
  if (useSupabase()) {
    return await getServiceRecordsFromSupabase();
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.SERVICE_RECORDS);
  return data ? JSON.parse(data) : [];
};

export const saveServiceRecord = async (record: ServiceRecord): Promise<void> => {
  if (useSupabase()) {
    return await saveServiceRecordToSupabase(record);
  }
  
  const records = getServiceRecords();
  const existingIndex = records.findIndex(r => r.id === record.id);
  
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  
  localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(records));
};

export const deleteServiceRecord = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteServiceRecordFromSupabase(id);
  }
  
  const records = getServiceRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(records));
};

export const getServiceRecordsByClient = async (clientId: string): Promise<ServiceRecord[]> => {
  if (useSupabase()) {
    return await getServiceRecordsByClientFromSupabase(clientId);
  }
  
  return getServiceRecords().filter(r => r.clientId === clientId);
};

// Initialize with mock data if empty
export const initializeStorage = async (): Promise<void> => {
  // Skip initialization if using Supabase (data is already in database)
  if (useSupabase()) {
    return;
  }
  
  const clients = await getClients();
  if (clients.length === 0) {
    const mockClients = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        phone: '(11) 99999-9999',
        company: 'Empresa ABC Ltda',
        cnpj: '12.345.678/0001-90',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        type: 'contrato',
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
        type: 'avulso',
        createdAt: new Date('2024-01-20'),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(mockClients));
  }

  const services = await getServices();
  if (services.length === 0) {
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

  const products = await getProducts();
  if (products.length === 0) {
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