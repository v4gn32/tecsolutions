// Layout condicional: institucional (com Header/Footer) ou sistema (shell com sidebar virá depois)
import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import Header from "./institutional/Header";
import Footer from "./institutional/Footer";
import { useAuth } from "../contexts/AuthContext";

type Props = { isSystem?: boolean };

export default function Layout({ isSystem = false }: Props) {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!isSystem) {
    // Layout do Site Institucional
    return (
      <>
        <Header />
        <main className="container-app py-8">
          <Outlet />
        </main>
        <Footer />
      </>
    );
  }

  // Layout do Sistema (sidebar/topbar simples para começar)
  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="border-r hidden lg:block">
        <div className="p-4 flex items-center gap-2">
          <img src="/logo.png" className="h-7 w-7" />
          <div className="font-bold">TecSolutions</div>
        </div>
        <nav className="px-3 py-2 flex flex-col gap-1">
          {[
            { to: "/app", label: "Dashboard" },
            { to: "/app/propostas", label: "Propostas" },
            { to: "/app/clientes", label: "Clientes" },
            { to: "/app/servicos", label: "Serviços" },
            { to: "/app/produtos", label: "Produtos" },
            { to: "/app/inventario/hardware", label: "Inventário Hardware" },
            { to: "/app/inventario/software", label: "Inventário Software" },
            { to: "/app/atendimentos", label: "Atendimentos" },
            { to: "/app/relatorios", label: "Relatórios" },
            { to: "/app/usuarios", label: "Usuários" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${isActive ? "bg-primary/10 text-slate-900 font-medium" : "hover:bg-slate-100"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-slate-600">
              {location.pathname}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">Olá, <b>{user?.name ?? "Usuário"}</b></span>
              <button
                onClick={logout}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="p-4">
          <div className="mx-auto max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
