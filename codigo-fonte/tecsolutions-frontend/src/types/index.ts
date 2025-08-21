// Tipos de domínio e DTOs (clients/services/products/proposals)

// ===== Utilitários =====
// Função: resposta paginada do backend
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== Clients =====
// Função: modelo de cliente recebido da API
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  cnpj?: string;
  address: string;
  type: "contrato" | "avulso";
  createdAt: string; // ISO
}

// Função: DTO de criação (envio sem id/createdAt)
export type CreateClientDTO = Omit<Client, "id" | "createdAt">;

// Função: DTO de atualização (envio parcial)
export type UpdateClientDTO = Partial<CreateClientDTO> & { id: string };

// ===== Services =====
// Função: modelo de serviço recebido da API
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category:
    | "infraestrutura"
    | "helpdesk"
    | "nuvem"
    | "backup"
    | "cabeamento"
    | "outros";
  unit: string;
  createdAt: string; // ISO
}

// Função: DTOs de serviço
export type CreateServiceDTO = Omit<Service, "id" | "createdAt">;
export type UpdateServiceDTO = Partial<CreateServiceDTO> & { id: string };

// ===== Products =====
// Função: modelo de produto recebido da API
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "cabos" | "conectores" | "equipamentos" | "acessorios" | "outros";
  unit: string;
  brand?: string;
  model?: string;
  stock?: number;
  createdAt: string; // ISO
}

// Função: DTOs de produto
export type CreateProductDTO = Omit<Product, "id" | "createdAt">;
export type UpdateProductDTO = Partial<CreateProductDTO> & { id: string };

// ===== Proposals =====
// Função: itens de serviços da proposta
export interface ProposalItem {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Função: itens de produtos da proposta
export interface ProposalProductItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Função: modelo de proposta recebido da API
export interface Proposal {
  id: string;
  clientId: string;
  number: string;
  title: string;
  description: string;
  items: ProposalItem[];
  productItems: ProposalProductItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: "rascunho" | "enviada" | "aprovada" | "recusada";
  validUntil: string; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
  notes?: string;
}

// Função: DTO de criação de proposta
export type CreateProposalDTO = Omit<
  Proposal,
  "id" | "number" | "createdAt" | "updatedAt"
>;

// Função: DTO de atualização de proposta
export type UpdateProposalDTO = Partial<CreateProposalDTO> & { id: string };

// Função: proposta com "joins" para PDF/visualização
export interface ProposalWithDetails extends Proposal {
  client: Client;
  services: Service[];
  products: Product[];
}
