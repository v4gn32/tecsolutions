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
  getServiceRecordsByClientFromSupabase,
  getClientUsersFromSupabase,
  saveClientUserToSupabase,
  deleteClientUserFromSupabase
} from './supabaseStorage';

const STORAGE_KEYS = {
  CLIENTS: 'tecsolutions_clients',
  SERVICES: 'tecsolutions_services',
  PRODUCTS: 'tecsolutions_products',
  PROPOSALS: 'tecsolutions_proposals',
  HARDWARE_INVENTORY: 'tecsolutions_hardware_inventory',
  SOFTWARE_INVENTORY: 'tecsolutions_software_inventory',
  CLIENT_USERS: 'tecsolutions_client_users',
  SERVICE_RECORDS: 'tecsolutions_service_records'
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
      console.log('Tentando salvar produto no Supabase');
      console.log('Tentando salvar serviço no Supabase');
      console.log('Usando Supabase para salvar cliente');
      return await saveClientToSupabase(client);
    }
    console.log('Salvando produto no localStorage');
    const products = await getProducts();
    console.log('Salvando serviço no localStorage');
    const services = await getServices();
    console.log('Usando localStorage para salvar cliente');
    console.log('Atualizando produto existente no índice:', existingIndex);
    const clients = await getClients();
    const existingIndex = clients.findIndex(c => c.id === client.id);
    console.log('Adicionando novo produto');
    console.log('Atualizando serviço existente no índice:', existingIndex);
    
    if (existingIndex >= 0) {
      console.log('Salvando no localStorage, total de produtos:', products.length);
      console.log('Adicionando novo serviço');
      console.log('Produto salvo com sucesso no localStorage');
      clients[existingIndex] = client;
      console.log('Cliente atualizado na posição:', existingIndex);
    } else {
      console.log('Salvando no localStorage, total de serviços:', services.length);
      clients.push(client);
      console.log('Serviço salvo com sucesso no localStorage');
      console.log('Novo cliente adicionado. Total de clientes:', clients.length);
    }
    
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    console.log('Cliente salvo no localStorage com sucesso');
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    throw error;
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteClientFromSupabase(id);
  }
  
  const clients = (await getClients()).filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

// Services
export const getServices = async (): Promise<Service[]> => {
  console.log('Carregando serviços...');
  
  if (useSupabase()) {
    console.log('Carregando do Supabase');
    try {
      return await getServicesFromSupabase();
    } catch (error) {
      console.error('Erro ao carregar do Supabase, usando localStorage:', error);
      // Fallback para localStorage se Supabase falhar
    }
  }
  
  console.log('Carregando do localStorage');
  const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
  const services = data ? JSON.parse(data).map((service: any) => ({
    ...service,
    createdAt: new Date(service.createdAt)
  })) : [];
  console.log('Serviços carregados:', services);
  return services;
};

export const saveService = async (service: Service): Promise<void> => {
  console.log('saveService chamado com:', service);
  
  try {
    if (useSupabase()) {
      return await saveServiceToSupabase(service);
    }
    
    const services = await getServices();
    const existingIndex = services.findIndex(s => s.id === service.id);
    
    if (existingIndex >= 0) {
      services[existingIndex] = service;
    } else {
      services.push(service);
    }
    
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  } catch (error) {
    console.error('Erro ao salvar serviço:', error);
    throw error;
  }
};

export const deleteService = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteServiceFromSupabase(id);
  }
  
  const services = (await getServices()).filter(s => s.id !== id);
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
  console.log('saveProduct chamado com:', product);
  
  try {
    if (useSupabase()) {
      return await saveProductToSupabase(product);
    }
    
    const products = await getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteProductFromSupabase(id);
  }
  
  const products = (await getProducts()).filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

// Proposals
export const getProposals = async (): Promise<Proposal[]> => {
  console.log('getProposals chamado');
  
  if (useSupabase()) {
    console.log('Carregando propostas do Supabase');
    try {
      return await getProposalsFromSupabase();
    } catch (error) {
      console.error('Erro ao carregar do Supabase, usando localStorage:', error);
      // Fallback para localStorage se Supabase falhar
    }
  }
  
  console.log('Carregando propostas do localStorage');
  const data = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
  console.log('Dados brutos do localStorage:', data);
  const proposals = data ? JSON.parse(data).map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    validUntil: new Date(p.validUntil)
  })) : [];
  console.log('Propostas carregadas do localStorage:', proposals);
  return proposals;
};

export const saveProposal = async (proposal: Proposal): Promise<void> => {
  console.log('saveProposal chamado com:', proposal);
  
  if (useSupabase()) {
    try {
      console.log('Tentando salvar no Supabase');
      return await saveProposalToSupabase(proposal);
    } catch (error) {
      console.error('Erro ao salvar no Supabase, usando localStorage:', error);
      // Fallback para localStorage se Supabase falhar
    }
  }
  
  console.log('Salvando no localStorage');
  const proposals = await getProposals();
  const existingIndex = proposals.findIndex(p => p.id === proposal.id);
  
  if (existingIndex >= 0) {
    console.log('Atualizando proposta existente no índice:', existingIndex);
    proposals[existingIndex] = proposal;
  } else {
    console.log('Adicionando nova proposta');
    proposals.push(proposal);
  }
  
  console.log('Salvando no localStorage, total de propostas:', proposals.length);
  localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
  console.log('Proposta salva com sucesso no localStorage');
};

export const deleteProposal = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteProposalFromSupabase(id);
  }
  
  const proposals = (await getProposals()).filter(p => p.id !== id);
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
  
  const inventory = await getHardwareInventory();
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
  
  const inventory = (await getHardwareInventory()).filter(h => h.id !== id);
  localStorage.setItem(STORAGE_KEYS.HARDWARE_INVENTORY, JSON.stringify(inventory));
};

export const getHardwareByClient = async (clientId: string): Promise<HardwareInventory[]> => {
  if (useSupabase()) {
    return await getHardwareByClientFromSupabase(clientId);
  }
  
  return (await getHardwareInventory()).filter(h => h.clientId === clientId);
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
  
  const inventory = await getSoftwareInventory();
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
  
  const inventory = (await getSoftwareInventory()).filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SOFTWARE_INVENTORY, JSON.stringify(inventory));
};

export const getSoftwareByClient = async (clientId: string): Promise<SoftwareInventory[]> => {
  if (useSupabase()) {
    return await getSoftwareByClientFromSupabase(clientId);
  }
  
  return (await getSoftwareInventory()).filter(s => s.clientId === clientId);
};

// Service Records
export const getServiceRecords = async (): Promise<any[]> => {
  if (useSupabase()) {
    return await getServiceRecordsFromSupabase();
  }
  
  const data = localStorage.getItem('tecsolutions_service_records');
  return data ? JSON.parse(data) : [];
};

export const saveServiceRecord = async (record: any): Promise<void> => {
  if (useSupabase()) {
    return await saveServiceRecordToSupabase(record);
  }
  
  const records = await getServiceRecords();
  const existingIndex = records.findIndex(r => r.id === record.id);
  
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  
  localStorage.setItem('tecsolutions_service_records', JSON.stringify(records));
};

export const deleteServiceRecord = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteServiceRecordFromSupabase(id);
  }
  
  const records = (await getServiceRecords()).filter(r => r.id !== id);
  localStorage.setItem('tecsolutions_service_records', JSON.stringify(records));
};

export const getServiceRecordsByClient = async (clientId: string): Promise<any[]> => {
  if (useSupabase()) {
    return await getServiceRecordsByClientFromSupabase(clientId);
  }
  
  return (await getServiceRecords()).filter(r => r.clientId === clientId);
};

// Client Users
export const getClientUsers = async (clientId: string): Promise<any[]> => {
  if (useSupabase()) {
    return await getClientUsersFromSupabase(clientId);
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.CLIENT_USERS);
  const allUsers = data ? JSON.parse(data) : [];
  return allUsers.filter((user: any) => user.clientId === clientId);
};

export const saveClientUser = async (user: any): Promise<void> => {
  if (useSupabase()) {
    return await saveClientUserToSupabase(user);
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.CLIENT_USERS);
  const allUsers = data ? JSON.parse(data) : [];
  const existingIndex = allUsers.findIndex((u: any) => u.id === user.id);
  
  if (existingIndex >= 0) {
    allUsers[existingIndex] = user;
  } else {
    allUsers.push(user);
  }
  
  localStorage.setItem(STORAGE_KEYS.CLIENT_USERS, JSON.stringify(allUsers));
};

export const deleteClientUser = async (id: string): Promise<void> => {
  if (useSupabase()) {
    return await deleteClientUserFromSupabase(id);
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.CLIENT_USERS);
  const allUsers = data ? JSON.parse(data) : [];
  const filteredUsers = allUsers.filter((user: any) => user.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLIENT_USERS, JSON.stringify(filteredUsers));
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
        street: 'Rua das Flores',
        number: '123',
        complement: 'Sala 101',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
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
        street: 'Av. Paulista',
        number: '456',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
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
      {
        id: '6',
        name: 'Instalação de Firewall',
        description: 'Configuração e instalação de firewall corporativo',
        price: 1200,
        category: 'infraestrutura',
        unit: 'unidade',
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '7',
        name: 'Manutenção Preventiva',
        description: 'Manutenção preventiva mensal de equipamentos',
        price: 300,
        category: 'helpdesk',
        unit: 'mês',
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '8',
        name: 'Consultoria em TI',
        description: 'Consultoria especializada em tecnologia da informação',
        price: 180,
        category: 'outros',
        unit: 'hora',
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '9',
        name: 'Implementação Office 365',
        description: 'Migração e configuração completa do Office 365',
        price: 1800,
        category: 'nuvem',
        unit: 'projeto',
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '10',
        name: 'Monitoramento 24/7',
        description: 'Monitoramento contínuo de infraestrutura de TI',
        price: 500,
        category: 'helpdesk',
        unit: 'mês',
        createdAt: new Date('2024-01-10'),
      }
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
      {
        id: '6',
        name: 'Switch 24 Portas Gigabit',
        description: 'Switch gerenciável 24 portas Gigabit Ethernet',
        price: 850.00,
        category: 'equipamentos',
        unit: 'unidade',
        brand: 'TP-Link',
        model: 'TL-SG3424',
        stock: 15,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '7',
        name: 'Roteador Wireless AC1200',
        description: 'Roteador wireless dual band AC1200 com 4 antenas',
        price: 180.00,
        category: 'equipamentos',
        unit: 'unidade',
        brand: 'TP-Link',
        model: 'Archer C6',
        stock: 25,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '8',
        name: 'Cabo HDMI 2.0',
        description: 'Cabo HDMI 2.0 4K Ultra HD com conectores banhados a ouro',
        price: 35.00,
        category: 'cabos',
        unit: 'unidade',
        brand: 'Elg',
        model: 'HDMI20-3M',
        stock: 100,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '9',
        name: 'Rack 19" 12U',
        description: 'Rack fechado 19 polegadas 12U com ventilação',
        price: 450.00,
        category: 'equipamentos',
        unit: 'unidade',
        brand: 'Weg',
        model: 'R12U-600',
        stock: 8,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '10',
        name: 'Organizador de Cabos',
        description: 'Organizador horizontal de cabos para rack 19"',
        price: 25.00,
        category: 'acessorios',
        unit: 'unidade',
        brand: 'Furukawa',
        model: 'OC-1U',
        stock: 50,
        createdAt: new Date('2024-01-10'),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockProducts));
  }
};