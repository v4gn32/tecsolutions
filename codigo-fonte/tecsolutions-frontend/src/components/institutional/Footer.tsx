// Rodapé institucional simples
export default function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="container-app py-6 text-sm text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} TecSolutions. Todos os direitos reservados.</p>
        <p className="opacity-80">Infra, Helpdesk, Nuvem & Relatórios</p>
      </div>
    </footer>
  );
}
