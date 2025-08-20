// src/components/CategoryBadge.tsx
// ✅ Badge simples para exibir CATEGORIA logo abaixo do título do card
import React from "react";

type Tone = "blue" | "green" | "yellow" | "purple" | "orange";

export const CategoryBadge: React.FC<{
  label: string;
  tone?: Tone;
  className?: string;
}> = ({ label, tone = "blue", className = "" }) => {
  const map: Record<Tone, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${map[tone]} ${className}`}
    >
      {label}
    </span>
  );
};

export default CategoryBadge;
