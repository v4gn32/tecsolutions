import { Client, Service, Product, Proposal, HardwareInventory, SoftwareInventory, ServiceRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Temporary localStorage implementation
// This will be replaced with proper API calls to a backend later

const STORAGE_KEYS = {
  CLIENTS: 'tecsolutions_clients',
  SERVICES: 'tecsolutions_services',
  PRODUCTS: 'tecsolutions_products',
  PROPOSALS: 'tecsolutions_proposals',
  HARDWARE: 'tecsolutions_hardware',
  SOFTWARE: 'tecsolutions_software',
  SERVICE_RECORDS: 'tecsolutions_service_records'
};

const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
};

// Clients
export const getClients = async (): Promise<Client[]> => {
  try {
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    return clients.map(client => ({
      ...client,
      createdAt: new Date(client.createdAt)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
};

export const saveClient = async (client: Client): Promise<void> => {
  try {
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const existingIndex = clients.findIndex(c => c.id === client.id);
    
    if (existingIndex >= 0) {
      clients[existingIndex] = client;
    } else {
      clients.push(client);
    }
    
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    throw error;
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  try {
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const filteredClients = clients.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CLIENTS, filteredClients);
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }
};

// Services
export const getServices = async (): Promise<Service[]> => {
  try {
    const services = getFromStorage<Service>(STORAGE_KEYS.SERVICES);
    return services.map(service => ({
      ...service,
      createdAt: new Date(service.createdAt)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }
};

export const saveService = async (service: Service): Promise<void> => {
  try {
    const services = getFromStorage<Service>(STORAGE_KEYS.SERVICES);
    const existingIndex = services.findIndex(s => s.id === service.id);
    
    if (existingIndex >= 0) {
      services[existingIndex] = service;
    } else {
      services.push(service);
    }
    
    saveToStorage(STORAGE_KEYS.SERVICES, services);
  } catch (error) {
    console.error('Erro ao salvar serviço:', error);
    throw error;
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    await query('DELETE FROM services WHERE id = $1', [id]);
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    throw error;
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const result = await query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category as Product['category'],
      unit: product.unit,
      brand: product.brand,
      model: product.model,
      stock: product.stock,
      createdAt: new Date(product.created_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

export const saveProduct = async (product: Product): Promise<void> => {
  try {
    const sql = `
      INSERT INTO products (id, name, description, price, category, unit, brand, model, stock, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        category = EXCLUDED.category,
        unit = EXCLUDED.unit,
        brand = EXCLUDED.brand,
        model = EXCLUDED.model,
        stock = EXCLUDED.stock
    `;
    await query(sql, [
      product.id,
      product.name,
      product.description,
      product.price,
      product.category,
      product.unit,
      product.brand,
      product.model,
      product.stock,
      product.createdAt.toISOString()
    ]);
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await query('DELETE FROM products WHERE id = $1', [id]);
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};

// Proposals
export const getProposals = async (): Promise<Proposal[]> => {
  try {
    const result = await query('SELECT * FROM proposals ORDER BY created_at DESC');
    return result.rows.map((proposal: any) => ({
      id: proposal.id,
      clientId: proposal.client_id,
      number: proposal.number,
      title: proposal.title,
      description: proposal.description,
      items: proposal.items,
      productItems: proposal.product_items,
      subtotal: parseFloat(proposal.subtotal),
      discount: parseFloat(proposal.discount),
      total: parseFloat(proposal.total),
      status: proposal.status as Proposal['status'],
      validUntil: new Date(proposal.valid_until),
      notes: proposal.notes,
      createdAt: new Date(proposal.created_at),
      updatedAt: new Date(proposal.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return [];
  }
};

export const saveProposal = async (proposal: Proposal): Promise<void> => {
  try {
    const sql = `
      INSERT INTO proposals (id, client_id, number, title, description, items, product_items, subtotal, discount, total, status, valid_until, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        client_id = EXCLUDED.client_id,
        number = EXCLUDED.number,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        items = EXCLUDED.items,
        product_items = EXCLUDED.product_items,
        subtotal = EXCLUDED.subtotal,
        discount = EXCLUDED.discount,
        total = EXCLUDED.total,
        status = EXCLUDED.status,
        valid_until = EXCLUDED.valid_until,
        notes = EXCLUDED.notes,
        updated_at = NOW()
    `;
    await query(sql, [
      proposal.id,
      proposal.clientId,
      proposal.number,
      proposal.title,
      proposal.description,
      JSON.stringify(proposal.items),
      JSON.stringify(proposal.productItems),
      proposal.subtotal,
      proposal.discount,
      proposal.total,
      proposal.status,
      proposal.validUntil.toISOString().split('T')[0],
      proposal.notes,
      proposal.createdAt.toISOString(),
      proposal.updatedAt.toISOString()
    ]);
  } catch (error) {
    console.error('Erro ao salvar proposta:', error);
    throw error;
  }
};

export const deleteProposal = async (id: string): Promise<void> => {
  try {
    await query('DELETE FROM proposals WHERE id = $1', [id]);
  } catch (error) {
    console.error('Erro ao deletar proposta:', error);
    throw error;
  }
};

// Hardware Inventory
export const getHardwareInventory = async (): Promise<HardwareInventory[]> => {
  try {
    const result = await query('SELECT * FROM hardware_inventory ORDER BY created_at DESC');
    return result.rows.map((hardware: any) => ({
      id: hardware.id,
      clientId: hardware.client_id,
      brand: hardware.brand,
      model: hardware.model,
      serialNumber: hardware.serial_number,
      processor: hardware.processor,
      memory: hardware.memory,
      storage: hardware.storage,
      operatingSystem: hardware.operating_system,
      deviceName: hardware.device_name,
      office: hardware.office,
      antivirus: hardware.antivirus,
      username: hardware.username,
      password: hardware.password,
      pin: hardware.pin,
      warranty: hardware.warranty,
      createdAt: new Date(hardware.created_at),
      updatedAt: new Date(hardware.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar inventário de hardware:', error);
    return [];
  }
};

export const saveHardwareInventory = async (hardware: HardwareInventory): Promise<void> => {
  try {
    const sql = `
      INSERT INTO hardware_inventory (id, client_id, brand, model, serial_number, processor, memory, storage, operating_system, device_name, office, antivirus, username, password, pin, warranty, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        client_id = EXCLUDED.client_id,
        brand = EXCLUDED.brand,
        model = EXCLUDED.model,
        serial_number = EXCLUDED.serial_number,
        processor = EXCLUDED.processor,
        memory = EXCLUDED.memory,
        storage = EXCLUDED.storage,
        operating_system = EXCLUDED.operating_system,
        device_name = EXCLUDED.device_name,
        office = EXCLUDED.office,
        antivirus = EXCLUDED.antivirus,
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        pin = EXCLUDED.pin,
        warranty = EXCLUDED.warranty,
        updated_at = NOW()
    `;
    await query(sql, [
      hardware.id,
      hardware.clientId,
      hardware.brand,
      hardware.model,
      hardware.serialNumber,
      hardware.processor,
      hardware.memory,
      hardware.storage,
      hardware.operatingSystem,
      hardware.deviceName,
      hardware.office,
      hardware.antivirus,
      hardware.username,
      hardware.password,
      hardware.pin,
      hardware.warranty,
      hardware.createdAt.toISOString(),
      hardware.updatedAt.toISOString()
    ]);
  } catch (error) {
    console.error('Erro ao salvar inventário de hardware:', error);
    throw error;
  }
};

export const deleteHardwareInventory = async (id: string): Promise<void> => {
  try {
    await query('DELETE FROM hardware_inventory WHERE id = $1', [id]);
  } catch (error) {
    console.error('Erro ao deletar inventário de hardware:', error);
    throw error;
  }
};

export const getHardwareByClient = async (clientId: string): Promise<HardwareInventory[]> => {
  try {
    const result = await query('SELECT * FROM hardware_inventory WHERE client_id = $1 ORDER BY created_at DESC', [clientId]);
    return result.rows.map((hardware: any) => ({
      id: hardware.id,
      clientId: hardware.client_id,
      brand: hardware.brand,
      model: hardware.model,
      serialNumber: hardware.serial_number,
      processor: hardware.processor,
      memory: hardware.memory,
      storage: hardware.storage,
      operatingSystem: hardware.operating_system,
      deviceName: hardware.device_name,
      office: hardware.office,
      antivirus: hardware.antivirus,
      username: hardware.username,
      password: hardware.password,
      pin: hardware.pin,
      warranty: hardware.warranty,
      createdAt: new Date(hardware.created_at),
      updatedAt: new Date(hardware.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar hardware por cliente:', error);
    return [];
  }
};

// Software Inventory
export const getSoftwareInventory = async (): Promise<SoftwareInventory[]> => {
  try {
    const result = await query('SELECT * FROM software_inventory ORDER BY created_at DESC');
    return result.rows.map((software: any) => ({
      id: software.id,
      clientId: software.client_id,
      login: software.login,
      password: software.password,
      softwareName: software.software_name,
      softwareType: software.software_type as SoftwareInventory['softwareType'],
      expirationAlert: new Date(software.expiration_alert),
      monthlyValue: software.monthly_value ? parseFloat(software.monthly_value) : undefined,
      annualValue: software.annual_value ? parseFloat(software.annual_value) : undefined,
      userControl: software.user_control as SoftwareInventory['userControl'],
      createdAt: new Date(software.created_at),
      updatedAt: new Date(software.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar inventário de software:', error);
    return [];
  }
};

export const saveSoftwareInventory = async (software: SoftwareInventory): Promise<void> => {
  try {
    const sql = `
      INSERT INTO software_inventory (id, client_id, login, password, software_name, software_type, expiration_alert, monthly_value, annual_value, user_control, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        client_id = EXCLUDED.client_id,
        login = EXCLUDED.login,
        password = EXCLUDED.password,
        software_name = EXCLUDED.software_name,
        software_type = EXCLUDED.software_type,
        expiration_alert = EXCLUDED.expiration_alert,
        monthly_value = EXCLUDED.monthly_value,
        annual_value = EXCLUDED.annual_value,
        user_control = EXCLUDED.user_control,
        updated_at = NOW()
    `;
    await query(sql, [
      software.id,
      software.clientId,
      software.login,
      software.password,
      software.softwareName,
      software.softwareType,
      software.expirationAlert.toISOString().split('T')[0],
      software.monthlyValue,
      software.annualValue,
      software.userControl,
      software.createdAt.toISOString(),
      software.updatedAt.toISOString()
    ]);
  } catch (error) {
    console.error('Erro ao salvar inventário de software:', error);
    throw error;
  }
};

export const deleteSoftwareInventory = async (id: string): Promise<void> => {
  try {
    await query('DELETE FROM software_inventory WHERE id = $1', [id]);
  } catch (error) {
    console.error('Erro ao deletar inventário de software:', error);
    throw error;
  }
};

export const getSoftwareByClient = async (clientId: string): Promise<SoftwareInventory[]> => {
  try {
    const result = await query('SELECT * FROM software_inventory WHERE client_id = $1 ORDER BY created_at DESC', [clientId]);
    return result.rows.map((software: any) => ({
      id: software.id,
      clientId: software.client_id,
      login: software.login,
      password: software.password,
      softwareName: software.software_name,
      softwareType: software.software_type as SoftwareInventory['softwareType'],
      expirationAlert: new Date(software.expiration_alert),
      monthlyValue: software.monthly_value ? parseFloat(software.monthly_value) : undefined,
      annualValue: software.annual_value ? parseFloat(software.annual_value) : undefined,
      userControl: software.user_control as SoftwareInventory['userControl'],
      createdAt: new Date(software.created_at),
      updatedAt: new Date(software.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar software por cliente:', error);
    return [];
  }
};

// Service Records
export const getServiceRecords = async (): Promise<ServiceRecord[]> => {
  try {
    const result = await query('SELECT * FROM service_records ORDER BY date DESC, created_at DESC');
    return result.rows.map((record: any) => ({
      id: record.id,
      clientId: record.client_id,
      type: record.type as ServiceRecord['type'],
      date: new Date(record.date),
      description: record.description,
      services: record.services,
      arrivalTime: record.arrival_time,
      departureTime: record.departure_time,
      lunchBreak: record.lunch_break,
      totalHours: record.total_hours ? parseFloat(record.total_hours) : undefined,
      deviceReceived: record.device_received,
      deviceReturned: record.device_returned,
      labServices: record.lab_services,
      thirdPartyCompany: record.third_party_company,
      sentDate: record.sent_date ? new Date(record.sent_date) : undefined,
      returnedDate: record.returned_date ? new Date(record.returned_date) : undefined,
      cost: record.cost ? parseFloat(record.cost) : undefined,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
      createdBy: record.created_by
    }));
  } catch (error) {
    console.error('Erro ao buscar registros de serviço:', error);
    return [];
  }
};

export const saveServiceRecord = async (record: ServiceRecord): Promise<void> => {
  try {
    const sql = `
      INSERT INTO service_records (id, client_id, type, date, description, services, arrival_time, departure_time, lunch_break, total_hours, device_received, device_returned, lab_services, third_party_company, sent_date, returned_date, cost, created_at, updated_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        client_id = EXCLUDED.client_id,
        type = EXCLUDED.type,
        date = EXCLUDED.date,
        description = EXCLUDED.description,
        services = EXCLUDED.services,
        arrival_time = EXCLUDED.arrival_time,
        departure_time = EXCLUDED.departure_time,
        lunch_break = EXCLUDED.lunch_break,
        total_hours = EXCLUDED.total_hours,
        device_received = EXCLUDED.device_received,
        device_returned = EXCLUDED.device_returned,
        lab_services = EXCLUDED.lab_services,
        third_party_company = EXCLUDED.third_party_company,
        sent_date = EXCLUDED.sent_date,
        returned_date = EXCLUDED.returned_date,
        cost = EXCLUDED.cost,
        updated_at = NOW(),
        created_by = EXCLUDED.created_by
    `;
    await query(sql, [
      record.id,
      record.clientId,
      record.type,
      record.date.toISOString().split('T')[0],
      record.description,
      record.services,
      record.arrivalTime,
      record.departureTime,
      record.lunchBreak,
      record.totalHours,
      record.deviceReceived,
      record.deviceReturned,
      record.labServices,
      record.thirdPartyCompany,
      record.sentDate ? record.sentDate.toISOString().split('T')[0] : null,
      record.returnedDate ? record.returnedDate.toISOString().split('T')[0] : null,
      record.cost,
      record.createdAt.toISOString(),
      record.updatedAt.toISOString(),
      record.createdBy
    ]);
  } catch (error) {
    console.error('Erro ao salvar registro de serviço:', error);
    throw error;
  }
};

export const deleteServiceRecord = async (id: string): Promise<void> => {
  try {
    await query('DELETE FROM service_records WHERE id = $1', [id]);
  } catch (error) {
    console.error('Erro ao deletar registro de serviço:', error);
    throw error;
  }
};

export const getServiceRecordsByClient = async (clientId: string): Promise<ServiceRecord[]> => {
  try {
    const result = await query('SELECT * FROM service_records WHERE client_id = $1 ORDER BY date DESC, created_at DESC', [clientId]);
    return result.rows.map((record: any) => ({
      id: record.id,
      clientId: record.client_id,
      type: record.type as ServiceRecord['type'],
      date: new Date(record.date),
      description: record.description,
      services: record.services,
      arrivalTime: record.arrival_time,
      departureTime: record.departure_time,
      lunchBreak: record.lunch_break,
      totalHours: record.total_hours ? parseFloat(record.total_hours) : undefined,
      deviceReceived: record.device_received,
      deviceReturned: record.device_returned,
      labServices: record.lab_services,
      thirdPartyCompany: record.third_party_company,
      sentDate: record.sent_date ? new Date(record.sent_date) : undefined,
      returnedDate: record.returned_date ? new Date(record.returned_date) : undefined,
      cost: record.cost ? parseFloat(record.cost) : undefined,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
      createdBy: record.created_by
    }));
  } catch (error) {
    console.error('Erro ao buscar registros de serviço por cliente:', error);
    return [];
  }
};

// Utility functions
export const generateId = (): string => {
  return uuidv4();
};

export const generateProposalNumber = async (): Promise<string> => {
  try {
    const result = await query('SELECT COUNT(*) as count FROM proposals');
    const count = parseInt(result.rows[0].count) + 1;
    return `PROP-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Erro ao gerar número da proposta:', error);
    return `PROP-${new Date().getFullYear()}-${Date.now()}`;
  }
};