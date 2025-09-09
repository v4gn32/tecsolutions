// Header institucional com navegação para Home, Sobre, Serviços e Contato
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container-app flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="TecSolutions" className="h-8 w-8" />
          <span className="font-bold text-slate-900">TecSolutions</span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink to="/" className={({isActive}) => isActive ? "text-primary font-semibold" : "hover:text-primary"}>
            Home
          </NavLink>
          <NavLink to="/sobre" className={({isActive}) => isActive ? "text-primary font-semibold" : "hover:text-primary"}>
            Sobre
          </NavLink>
          <NavLink to="/servicos" className={({isActive}) => isActive ? "text-primary font-semibold" : "hover:text-primary"}>
            Serviços
          </NavLink>
          <NavLink to="/contato" className={({isActive}) => isActive ? "text-primary font-semibold" : "hover:text-primary"}>
            Contato
          </NavLink>
          <Link
            to="/login"
            className="rounded-md bg-primary px-4 py-2 font-medium text-slate-900 hover:opacity-90"
          >
            Acessar o Sistema
          </Link>
        </nav>
      </div>
    </header>
  );
}
