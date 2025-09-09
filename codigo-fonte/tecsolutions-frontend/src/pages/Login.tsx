// Tela de login com email/CPF + senha, chamando AuthContext.login
import { FormEvent, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await login(identifier, password);
      window.location.href = "/app";
    } catch (error: any) {
      setErr(error?.response?.data?.message ?? "Credenciais inválidas");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center">
      <div className="w-full max-w-sm rounded-xl border p-6">
        <div className="mb-4 text-center">
          <img src="/logo.png" className="mx-auto h-10 w-10" />
          <h1 className="mt-2 text-xl font-bold">Acessar o Sistema</h1>
          <p className="text-sm text-slate-600">Entre com seu e-mail/CPF e senha</p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            className="rounded-md border p-2"
            placeholder="E-mail ou CPF"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <input
            className="rounded-md border p-2"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            disabled={submitting}
            className="rounded-md bg-primary px-4 py-2 font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
          <button
            type="button"
            className="text-left text-sm text-slate-600 hover:underline"
            onClick={() => alert("Fluxo de 'Esqueci minha senha' será integrado depois.")}
          >
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
}
