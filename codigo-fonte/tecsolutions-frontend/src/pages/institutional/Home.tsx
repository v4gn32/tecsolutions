// Home institucional - segue a estrutura da imagem do projeto
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Plataforma TecSolutions
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Gerencie propostas, cronogramas, clientes, serviços, produtos e relatórios em um só lugar.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/login" className="rounded-md bg-primary px-5 py-2 font-medium text-slate-900 hover:opacity-90">
            Acessar o Sistema
          </Link>
          <Link to="/servicos" className="rounded-md border px-5 py-2 font-medium hover:bg-slate-50">
            Nossos Serviços
          </Link>
        </div>
      </div>
    </section>
  );
}
