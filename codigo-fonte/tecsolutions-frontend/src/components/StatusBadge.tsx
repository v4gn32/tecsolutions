// src/components/StatusBadge.tsx
import React from "react";

interface StatusBadgeProps {
  // aceita string para suportar variações vindas do backend
  status: "rascunho" | "enviada" | "aprovada" | "recusada" | string;
  className?: string; // permite ajustar no card (margens etc.)
}

/* 🔁 Normaliza status e trata sinônimos comuns do backend */
const normalizeStatus = (raw: string) => {
  const s = (raw ?? "").toString().trim().toLowerCase();

  // mapa de sinônimos → pt-br
  const aliases: Record<
    string,
    "rascunho" | "enviada" | "aprovada" | "recusada"
  > = {
    draft: "rascunho",
    pending: "enviada",
    sent: "enviada",
    approved: "aprovada",
    accepted: "aprovada",
    rejected: "recusada",
    declined: "recusada",
  };

  // se já vier em pt válido, mantém; senão tenta alias; senão rascunho
  if (["rascunho", "enviada", "aprovada", "recusada"].includes(s))
    return s as any;
  return aliases[s] || "rascunho";
};

/* 🎨 Define cores/label por status */
const getStatusConfig = (
  status: "rascunho" | "enviada" | "aprovada" | "recusada"
) => {
  switch (status) {
    case "rascunho":
      return { bg: "bg-gray-100", text: "text-gray-800", label: "Rascunho" };
    case "enviada":
      return { bg: "bg-blue-100", text: "text-blue-800", label: "Enviada" };
    case "aprovada":
      return { bg: "bg-green-100", text: "text-green-800", label: "Aprovada" };
    case "recusada":
      return { bg: "bg-red-100", text: "text-red-800", label: "Recusada" };
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  // 🧼 normaliza entradas (resolve maiúsculas e sinônimos)
  const norm = normalizeStatus(status);
  const cfg = getStatusConfig(norm);

  return (
    // 🏷️ Badge com tooltip do valor original (útil para debug)
    <span
      title={`Status: ${status}`}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} ${className}`}
    >
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
