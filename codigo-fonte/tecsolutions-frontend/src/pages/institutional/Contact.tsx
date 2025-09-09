export default function Contact() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Contato</h2>
      <form className="grid gap-3 max-w-xl">
        <input className="rounded-md border p-2" placeholder="Nome" />
        <input className="rounded-md border p-2" placeholder="E-mail" type="email" />
        <input className="rounded-md border p-2" placeholder="Telefone" />
        <textarea className="rounded-md border p-2" placeholder="Mensagem" rows={5} />
        <button className="rounded-md bg-primary px-4 py-2 font-medium text-slate-900 hover:opacity-90">
          Enviar
        </button>
      </form>
      <div className="text-sm text-slate-600">
        <p><b>Telefone:</b> (11) 0000-0000</p>
        <p><b>E-mail:</b> contato@tecsolutions.com</p>
      </div>
    </section>
  );
}
