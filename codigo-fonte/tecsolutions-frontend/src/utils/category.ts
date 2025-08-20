// src/utils/category.ts
// ✅ Converte valores do banco (enum/código) para rótulo e cor da badge

// Serviços
export const serviceCategoryLabel = (v?: string) => {
  const key = (v || "").toLowerCase();
  const map: Record<string, string> = {
    infraestrutura: "Infraestrutura",
    helpdesk: "Helpdesk",
    backup: "Backup",
    nuvem: "Nuvem",
    cabeamento: "Cabeamento",
  };
  return map[key] || v || "Categoria";
};

export const serviceCategoryTone = (v?: string) => {
  const key = (v || "").toLowerCase();
  const map: Record<string, "blue" | "green" | "yellow" | "purple" | "orange"> =
    {
      infraestrutura: "blue",
      helpdesk: "green",
      backup: "orange",
      nuvem: "purple",
      cabeamento: "yellow",
    };
  return map[key] || "blue";
};

// Produtos
export const productCategoryLabel = (v?: string) => {
  const key = (v || "").toLowerCase();
  const map: Record<string, string> = {
    cabos: "Cabos",
    conectores: "Conectores",
    equipamentos: "Equipamentos",
    acessorios: "Acessórios",
  };
  return map[key] || v || "Categoria";
};

export const productCategoryTone = (v?: string) => {
  const key = (v || "").toLowerCase();
  const map: Record<string, "blue" | "green" | "yellow" | "purple" | "orange"> =
    {
      cabos: "purple",
      conectores: "green",
      equipamentos: "purple",
      acessorios: "orange",
    };
  return map[key] || "blue";
};
