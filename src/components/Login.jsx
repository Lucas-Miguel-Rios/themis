import { useState } from "react"
import { supabase } from "../supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [modo, setModo] = useState("login") // login ou cadastro
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [lembrar, setLembrar] = useState(false)


  async function handleSubmit() {
    if (!email.trim() || !senha.trim()) {
      setMensagem("Preencha email e senha!")
      return
    }
    setCarregando(true)
    setMensagem("")

    if (modo === "cadastro") {
      const { error } = await supabase.auth.signUp({ email, password: senha })
      if (error) setMensagem("Erro ao cadastrar: " + error.message)
      else setMensagem("Cadastro realizado! Verifique seu email para confirmar.")
    } else {
      const { error } = await supabase.auth.signInWithPassword(
        { email, password: senha },
        { persistSession: lembrar }
      )
      if (error) setMensagem("Email ou senha incorretos.")
    }
    setCarregando(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="6" r="2.5" fill="#ca8a04" />
            <line x1="14" y1="8.5" x2="14" y2="18" stroke="#ca8a04" strokeWidth="1.5" />
            <line x1="4" y1="18" x2="24" y2="18" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="11" x2="5" y2="14" stroke="#ca8a04" strokeWidth="1.2" />
            <line x1="14" y1="11" x2="23" y2="14" stroke="#ca8a04" strokeWidth="1.2" />
            <ellipse cx="5" cy="14.5" rx="4" ry="1.5" fill="#ca8a04" opacity="0.7" />
            <ellipse cx="23" cy="14.5" rx="4" ry="1.5" fill="#ca8a04" opacity="0.7" />
          </svg>
          <div>
            <h1 className="text-xl font-bold text-yellow-600 tracking-widest leading-none">THEMIS</h1>
            <p className="text-xs text-zinc-500 tracking-widest">INTELIGÊNCIA JURÍDICA</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-zinc-100 mb-1">
          {modo === "login" ? "Entrar" : "Criar conta"}
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          {modo === "login" ? "Acesse sua conta do Themis" : "Crie sua conta gratuitamente"}
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Email</p>
            <input
              type="email"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Senha</p>
            <input
              type="password"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {mensagem && (
            <p className="text-sm text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
              {mensagem}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={carregando}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-zinc-950 font-bold py-3 rounded-lg text-sm transition-colors"
          >
            {carregando ? "⏳ Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
          </button>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="lembrar"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
              className="accent-yellow-600"
            />
            <label htmlFor="lembrar" className="text-sm text-zinc-400 cursor-pointer">
              Lembrar de mim
            </label>
          </div>
          <button
            onClick={() => { setModo(modo === "login" ? "cadastro" : "login"); setMensagem("") }}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors text-center"
          >
            {modo === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>
    </div>
  )
}