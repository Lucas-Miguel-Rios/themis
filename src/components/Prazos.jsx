import { useState } from "react"

function Prazos() {
  const [prazos, setPrazos] = useState([])
  const [nome, setNome] = useState("")
  const [data, setData] = useState("")

  function calcularDias(dataLimite) {
    const hoje = new Date()
    const limite = new Date(dataLimite)
    const diff = limite - hoje
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  function adicionarPrazo() {
    if (!nome.trim() || !data) {
      alert("Preencha o nome e a data do prazo!")
      return
    }
    const novoPrazo = { id: Date.now(), nome, data }
    setPrazos([...prazos, novoPrazo])
    setNome("")
    setData("")
  }

  function removerPrazo(id) {
    setPrazos(prazos.filter((p) => p.id !== id))
  }

  function corDoCard(dias) {
    if (dias <= 3) return "border-red-500 bg-red-500/10"
    if (dias <= 7) return "border-orange-400 bg-orange-400/10"
    return "border-green-500 bg-green-500/10"
  }

  function corDoDia(dias) {
    if (dias <= 3) return "text-red-400"
    if (dias <= 7) return "text-orange-400"
    return "text-green-400"
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6">
      <h3 className="text-lg font-bold text-zinc-100 mb-4">📅 Gestão de Prazos</h3>

      {/* Formulário */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Nome do processo</p>
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-100"
            placeholder="Ex: Reclamação Trabalhista - João Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Data limite</p>
          <input
            type="date"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-100"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={adicionarPrazo}
        className="w-full bg-yellow-600 hover:bg-yellow-500 text-zinc-950 font-bold py-2 rounded-lg text-sm transition-colors mb-6"
      >
        + Adicionar Prazo
      </button>

      {/* Lista de prazos */}
      {prazos.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-4">Nenhum prazo cadastrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {prazos.map((prazo) => {
            const dias = calcularDias(prazo.data)
            return (
              <div key={prazo.id} className={`border rounded-lg p-4 flex items-center justify-between ${corDoCard(dias)}`}>
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-12">
                    <p className={`text-2xl font-bold ${corDoDia(dias)}`}>{dias}</p>
                    <p className="text-xs text-zinc-500">dias</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{prazo.nome}</p>
                    <p className="text-xs text-zinc-500">Vence em {new Date(prazo.data).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <button
                  onClick={() => removerPrazo(prazo.id)}
                  className="text-zinc-600 hover:text-red-400 text-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Prazos