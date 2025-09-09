import { Pool, PoolClient } from 'pg';

// Configuração do PostgreSQL
const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'db_tecsolutions',
  user: import.meta.env.VITE_DB_USER || 'vagneradmin',
  password: import.meta.env.VITE_DB_PASSWORD || 'Mudar2025',
  ssl: import.meta.env.VITE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

console.log('Configuração PostgreSQL:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user ? 'Configurado' : 'Não configurado',
  password: dbConfig.password ? 'Configurado' : 'Não configurado'
});

// Pool de conexões PostgreSQL
export const pool = new Pool(dbConfig);

// Função para executar queries
export const query = async (text: string, params?: any[]): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Erro na query PostgreSQL:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Função para obter uma conexão do pool
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

// Função para testar a conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()');
    console.log('Conexão PostgreSQL estabelecida com sucesso:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Erro ao conectar com PostgreSQL:', error);
    return false;
  }
};

// Types para as tabelas do banco de dados
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          company: string
          cnpj: string | null
          address: string
          type: 'contrato' | 'avulso'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          company: string
          cnpj?: string | null
          address: string
          type: 'contrato' | 'avulso'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          company?: string
          cnpj?: string | null
          address?: string
          type?: 'contrato' | 'avulso'
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category: 'infraestrutura' | 'helpdesk' | 'nuvem' | 'backup' | 'cabeamento' | 'outros'
          unit: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category: 'infraestrutura' | 'helpdesk' | 'nuvem' | 'backup' | 'cabeamento' | 'outros'
          unit: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category?: 'infraestrutura' | 'helpdesk' | 'nuvem' | 'backup' | 'cabeamento' | 'outros'
          unit?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category: 'cabos' | 'conectores' | 'equipamentos' | 'acessorios' | 'outros'
          unit: string
          brand: string | null
          model: string | null
          stock: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category: 'cabos' | 'conectores' | 'equipamentos' | 'acessorios' | 'outros'
          unit: string
          brand?: string | null
          model?: string | null
          stock?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category?: 'cabos' | 'conectores' | 'equipamentos' | 'acessorios' | 'outros'
          unit?: string
          brand?: string | null
          model?: string | null
          stock?: number | null
          created_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          client_id: string
          number: string
          title: string
          description: string
          items: any[]
          product_items: any[]
          subtotal: number
          discount: number
          total: number
          status: 'rascunho' | 'enviada' | 'aprovada' | 'recusada'
          valid_until: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          number: string
          title: string
          description: string
          items: any[]
          product_items: any[]
          subtotal: number
          discount: number
          total: number
          status: 'rascunho' | 'enviada' | 'aprovada' | 'recusada'
          valid_until: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          number?: string
          title?: string
          description?: string
          items?: any[]
          product_items?: any[]
          subtotal?: number
          discount?: number
          total?: number
          status?: 'rascunho' | 'enviada' | 'aprovada' | 'recusada'
          valid_until?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hardware_inventory: {
        Row: {
          id: string
          client_id: string
          brand: string
          model: string
          serial_number: string
          processor: string
          memory: string
          storage: string
          operating_system: string
          device_name: string
          office: string
          antivirus: string
          username: string
          password: string
          pin: string
          warranty: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          brand: string
          model: string
          serial_number: string
          processor: string
          memory: string
          storage: string
          operating_system: string
          device_name: string
          office: string
          antivirus: string
          username: string
          password: string
          pin: string
          warranty: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          brand?: string
          model?: string
          serial_number?: string
          processor?: string
          memory?: string
          storage?: string
          operating_system?: string
          device_name?: string
          office?: string
          antivirus?: string
          username?: string
          password?: string
          pin?: string
          warranty?: string
          created_at?: string
          updated_at?: string
        }
      }
      software_inventory: {
        Row: {
          id: string
          client_id: string
          login: string
          password: string
          software_name: string
          software_type: 'local' | 'cloud' | 'subscription' | 'license' | 'outros'
          expiration_alert: string
          monthly_value: number | null
          annual_value: number | null
          user_control: 'ad_local' | 'cloud' | 'none'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          login: string
          password: string
          software_name: string
          software_type: 'local' | 'cloud' | 'subscription' | 'license' | 'outros'
          expiration_alert: string
          monthly_value?: number | null
          annual_value?: number | null
          user_control: 'ad_local' | 'cloud' | 'none'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          login?: string
          password?: string
          software_name?: string
          software_type?: 'local' | 'cloud' | 'subscription' | 'license' | 'outros'
          expiration_alert?: string
          monthly_value?: number | null
          annual_value?: number | null
          user_control?: 'ad_local' | 'cloud' | 'none'
          created_at?: string
          updated_at?: string
        }
      }
      service_records: {
        Row: {
          id: string
          client_id: string
          type: 'remote' | 'onsite' | 'laboratory' | 'third_party'
          date: string
          description: string
          services: string[]
          arrival_time: string | null
          departure_time: string | null
          lunch_break: boolean | null
          total_hours: number | null
          device_received: string | null
          device_returned: string | null
          lab_services: string[] | null
          third_party_company: string | null
          sent_date: string | null
          returned_date: string | null
          cost: number | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          client_id: string
          type: 'remote' | 'onsite' | 'laboratory' | 'third_party'
          date: string
          description: string
          services: string[]
          arrival_time?: string | null
          departure_time?: string | null
          lunch_break?: boolean | null
          total_hours?: number | null
          device_received?: string | null
          device_returned?: string | null
          lab_services?: string[] | null
          third_party_company?: string | null
          sent_date?: string | null
          returned_date?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          client_id?: string
          type?: 'remote' | 'onsite' | 'laboratory' | 'third_party'
          date?: string
          description?: string
          services?: string[]
          arrival_time?: string | null
          departure_time?: string | null
          lunch_break?: boolean | null
          total_hours?: number | null
          device_received?: string | null
          device_returned?: string | null
          lab_services?: string[] | null
          third_party_company?: string | null
          sent_date?: string | null
          returned_date?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
    }
  }
}