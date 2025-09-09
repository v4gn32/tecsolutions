export default function Services() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Serviços</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Helpdesk", "Infraestrutura", "Nuvem", "Backup", "Relatórios", "Cabling"].map((s) => (
          <div key={s} className="rounded-lg border p-4">
            <h3 className="font-semibold">{s}</h3>
            <p className="text-sm text-slate-600">Descrição breve do serviço {s}.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
