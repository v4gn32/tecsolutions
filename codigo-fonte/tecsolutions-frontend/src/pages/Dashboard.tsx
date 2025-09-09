// Dashboard com cards de atalho para os módulos (layout base da imagem)
import { Link } from "react-router-dom";

const Card = ({ to, title, desc }: { to: string; title: string; desc: string }) => (
  <Link to={to} className="rounded-xl border p-4 hover:shadow-sm transition">
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-slate-600">{desc}</p>
  </Link>
);

export default function Dashboard() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card to="/app/propostas" title="Propostas" desc="Gerencie propostas comerciais." />
        <Card to="/app/clientes" title="Clientes" desc="Cadastre e edite clientes." />
        <Card to="/app/servicos" title="Serviços" desc="Cadastre e gerencie serviços." />
        <Card to="/app/produtos" title="Produtos" desc="Estoque e catálogo." />
        <Card to="/app/inventario/hardware" title="Inventário de Hardware" desc="PCs, notebooks, impressoras..." />
        <Card to="/app/inventario/software" title="Inventário de Software" desc="Licenças, versões e validade." />
        <Card to="/app/atendimentos" title="Atendimentos" desc="Remoto, presencial, laboratório, terceiros." />
        <Card to="/app/relatorios" title="Relatórios" desc="Gere PDFs e planilhas." />
        <Card to="/app/usuarios" title="Usuários" desc="Controle de acesso e perfis." />
      </div>
    </section>
  );
}
