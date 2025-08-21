// src/utils/storage.ts
// Comentário: liga o frontend ao backend (sem mocks/localStorage)

import type { Client, Service, Product, Proposal } from "../types";
import { getAuthHeaders } from "../utils/auth"; // Comentário: monta os headers com Bearer

const API = import.meta.env.VITE_API_URL ?? ""; // ex.: http://localhost:5000/api

// 🔧 Helper: request genérica com headers + tratamento de erro
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) }, // Comentário: inclui Authorization
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

/* ============================================================================
   CLIENTES
============================================================================ */
export async function getClients(): Promise<Client[]> {
  try {
    return await apiRequest<Client[]>("/clients");
  } catch (e) {
    console.error("Erro ao buscar clientes:", e);
    return [];
  }
}

export async function saveClient(client: Client): Promise<Client | null> {
  try {
    const hasId = Boolean(client.id);
    return await apiRequest<Client>(
      hasId ? `/clients/${client.id}` : "/clients",
      {
        method: hasId ? "PUT" : "POST",
        body: JSON.stringify(client),
      }
    );
  } catch (e) {
    console.error("Erro ao salvar cliente:", e);
    return null;
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    await apiRequest<void>(`/clients/${id}`, { method: "DELETE" });
    return true;
  } catch (e) {
    console.error("Erro ao excluir cliente:", e);
    return false;
  }
}

/* ============================================================================
   SERVIÇOS
============================================================================ */
export async function getServices(): Promise<Service[]> {
  try {
    return await apiRequest<Service[]>("/services");
  } catch (e) {
    console.error("Erro ao buscar serviços:", e);
    return [];
  }
}

export async function saveService(service: Service): Promise<Service | null> {
  try {
    const hasId = Boolean(service.id);
    return await apiRequest<Service>(
      hasId ? `/services/${service.id}` : "/services",
      {
        method: hasId ? "PUT" : "POST",
        body: JSON.stringify(service),
      }
    );
  } catch (e) {
    console.error("Erro ao salvar serviço:", e);
    return null;
  }
}

export async function deleteService(id: string): Promise<boolean> {
  try {
    await apiRequest<void>(`/services/${id}`, { method: "DELETE" });
    return true;
  } catch (e) {
    console.error("Erro ao excluir serviço:", e);
    return false;
  }
}

/* ============================================================================
   PRODUTOS
============================================================================ */
export async function getProducts(): Promise<Product[]> {
  try {
    return await apiRequest<Product[]>("/products");
  } catch (e) {
    console.error("Erro ao buscar produtos:", e);
    return [];
  }
}

export async function saveProduct(product: Product): Promise<Product | null> {
  try {
    const hasId = Boolean(product.id);
    return await apiRequest<Product>(
      hasId ? `/products/${product.id}` : "/products",
      {
        method: hasId ? "PUT" : "POST",
        body: JSON.stringify(product),
      }
    );
  } catch (e) {
    console.error("Erro ao salvar produto:", e);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await apiRequest<void>(`/products/${id}`, { method: "DELETE" });
    return true;
  } catch (e) {
    console.error("Erro ao excluir produto:", e);
    return false;
  }
}

/* ============================================================================
   PROPOSTAS
============================================================================ */
export async function getProposals(): Promise<Proposal[]> {
  try {
    return await apiRequest<Proposal[]>("/proposals");
  } catch (e) {
    console.error("Erro ao buscar propostas:", e);
    return [];
  }
}

export async function saveProposal(
  proposal: Proposal
): Promise<Proposal | null> {
  try {
    const hasId = Boolean(proposal.id);
    return await apiRequest<Proposal>(
      hasId ? `/proposals/${proposal.id}` : "/proposals",
      {
        method: hasId ? "PUT" : "POST",
        body: JSON.stringify(proposal),
      }
    );
  } catch (e) {
    console.error("Erro ao salvar proposta:", e);
    return null;
  }
}

export async function deleteProposal(id: string): Promise<boolean> {
  try {
    await apiRequest<void>(`/proposals/${id}`, { method: "DELETE" });
    return true;
  } catch (e) {
    console.error("Erro ao excluir proposta:", e);
    return false;
  }
}

/* ============================================================================
   Inicialização (sem mocks)
============================================================================ */
export async function initializeStorage(): Promise<void> {
  // Comentário: intencionalmente vazio; dados vêm do backend.
}
