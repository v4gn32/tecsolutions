-- Script de inicialização do banco de dados PostgreSQL
-- Banco: db_tecsolutions

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    address TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('contrato', 'avulso')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('infraestrutura', 'helpdesk', 'nuvem', 'backup', 'cabeamento', 'outros')),
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('cabos', 'conectores', 'equipamentos', 'acessorios', 'outros')),
    unit VARCHAR(50) NOT NULL,
    brand VARCHAR(255),
    model VARCHAR(255),
    stock INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de propostas
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    product_items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('rascunho', 'enviada', 'aprovada', 'recusada')),
    valid_until DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de inventário de hardware
CREATE TABLE IF NOT EXISTS hardware_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) NOT NULL,
    processor VARCHAR(255) NOT NULL,
    memory VARCHAR(255) NOT NULL,
    storage VARCHAR(255) NOT NULL,
    operating_system VARCHAR(255) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    office VARCHAR(255) NOT NULL,
    antivirus VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    pin VARCHAR(255) NOT NULL,
    warranty VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de inventário de software
CREATE TABLE IF NOT EXISTS software_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    login VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    software_name VARCHAR(255) NOT NULL,
    software_type VARCHAR(50) NOT NULL CHECK (software_type IN ('local', 'cloud', 'subscription', 'license', 'outros')),
    expiration_alert DATE NOT NULL,
    monthly_value DECIMAL(10,2),
    annual_value DECIMAL(10,2),
    user_control VARCHAR(20) NOT NULL CHECK (user_control IN ('ad_local', 'cloud', 'none')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de serviços
CREATE TABLE IF NOT EXISTS service_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('remote', 'onsite', 'laboratory', 'third_party')),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    services TEXT[] NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    lunch_break BOOLEAN,
    total_hours DECIMAL(4,2),
    device_received TEXT,
    device_returned TEXT,
    lab_services TEXT[],
    third_party_company VARCHAR(255),
    sent_date DATE,
    returned_date DATE,
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_cnpj ON clients(cnpj);
CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_hardware_inventory_client_id ON hardware_inventory(client_id);
CREATE INDEX IF NOT EXISTS idx_software_inventory_client_id ON software_inventory(client_id);
CREATE INDEX IF NOT EXISTS idx_service_records_client_id ON service_records(client_id);
CREATE INDEX IF NOT EXISTS idx_service_records_date ON service_records(date);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_inventory_updated_at BEFORE UPDATE ON hardware_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_software_inventory_updated_at BEFORE UPDATE ON software_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_records_updated_at BEFORE UPDATE ON service_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE clients IS 'Tabela de clientes da TecSolutions';
COMMENT ON TABLE services IS 'Tabela de serviços oferecidos';
COMMENT ON TABLE products IS 'Tabela de produtos disponíveis';
COMMENT ON TABLE proposals IS 'Tabela de propostas comerciais';
COMMENT ON TABLE hardware_inventory IS 'Inventário de hardware dos clientes';
COMMENT ON TABLE software_inventory IS 'Inventário de software dos clientes';
COMMENT ON TABLE service_records IS 'Registros de atendimentos realizados';