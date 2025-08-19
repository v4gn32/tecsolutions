// src/services/clients.ts
// Clientes (listagem sem layout)
import { api } from "./api";
export type Client = {
  id: string;
  name: string;
  cnpj?: string;
  status?: string;
};
export async function listClients(params?: { search?: string }) {
  const { data } = await api.get("/clients", { params });
  return data as Client[];
}
