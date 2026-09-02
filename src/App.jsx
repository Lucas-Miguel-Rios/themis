import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import jsPDF from "jspdf"
import Prazos from "./components/Prazos"
import Historico, { salvarPeticaoNoHistorico } from "./components/Historico"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"
import Multas from "./components/Multas"
import Disclaimer from "./components/Disclaimer"
import { LayoutDashboard, FileText, Clock, AlertTriangle, Folder, History, LogOut } from "lucide-react"
import { supabase } from "./supabase"
import Login from "./components/Login"



function App() {
  const [fatos, setFatos] = useState("")
  const [tipoPeca, setTipoPeca] = useState("Petição Inicial")
  const [areaDireito, setAreaDireito] = useState("Direito Civil")
  const [peticao, setPeticao] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [tela, setTela] = useState("dashboard")
  const [totalPeticoes, setTotalPeticoes] = useState(0)
  const [totalPrazos, setTotalPrazos] = useState(0)
  const [usuario, setUsuario] = useState(null)
  const [dadosTrabalhistas, setDadosTrabalhistas] = useState({
    nomeTrabalhador: "",
    cpf: "",
    cargo: "",
    salario: "",

    empresa: "",
    cnpj: "",
    cidade: "",
    estado: "",

    dataAdmissao: "",
    dataDemissao: "",
    motivoDemissao: "",

    recebeuVerbasRescisorias: "",
    recebeuAvisoPrevio: "",
    recebeuDecimoTerceiro: "",
    recebeuFerias: "",
    recebeuFGTS: "",
    recebeuMultaFGTS: "",

    horasExtras: "",
    horasPorDia: "",
    trabalhoFimSemana: "",
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const historico = JSON.parse(localStorage.getItem("themis_historico") || "[]")
    const prazos = JSON.parse(localStorage.getItem("themis_prazos") || "[]")
    setTotalPeticoes(historico.length)
    setTotalPrazos(prazos.length)
  }, [tela])

  async function gerarPeticao() {
    if (!fatos.trim()) {
      alert("Descreva os fatos do caso antes de gerar a petição!")
      return
    }
    setCarregando(true)
    setPeticao("")
    console.log("CHAVE:", import.meta.env.VITE_GEMINI_KEY)
    try {
      const resposta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Você é um assistente jurídico especializado no Direito Brasileiro. Gere uma ${tipoPeca} completa e profissional para a área de ${areaDireito}. Baseie-se nos seguintes fatos: ${fatos}. Siga a formatação padrão da OAB, cite artigos de lei e jurisprudência relevante.` }] }]
          })
        }
      )
      const dados = await resposta.json()
      const texto = dados.candidates[0].content.parts[0].text
      setPeticao(texto)
      salvarPeticaoNoHistorico({ tipoPeca, areaDireito, fatos, peticao: texto })
    } catch (erro) {
      alert("Erro ao gerar petição. Tente novamente.")
      console.error(erro)
    }
    setCarregando(false)
  }

  function exportarPDF() {
    const doc = new jsPDF()
    const margemEsquerda = 15
    const margemSuperior = 20
    const larguraMaxima = 180
    const tamanhoFonte = 11
    doc.setFont("times", "normal")
    doc.setFontSize(tamanhoFonte)
    const linhas = doc.splitTextToSize(peticao, larguraMaxima)
    let posicaoY = margemSuperior
    const alturaLinha = 7
    const alturaMaximaPagina = 270
    linhas.forEach((linha) => {
      if (posicaoY + alturaLinha > alturaMaximaPagina) {
        doc.addPage()
        posicaoY = margemSuperior
      }
      doc.text(linha, margemEsquerda, posicaoY)
      posicaoY += alturaLinha
    })
    doc.save("peticao-themis.pdf")
  }

  async function exportarWord() {
    const paragrafos = peticao.split("\n").map((linha) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: linha,
            size: 24,
            font: "Times New Roman",
          }),
        ],
        spacing: { after: 200 },
      })
    })
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
            },
          },
          children: paragrafos,
        },
      ],
    })
    const blob = await Packer.toBlob(doc)
    saveAs(blob, "peticao-themis.docx")
  }

  function reabrirPeticao(p) {
    setFatos(p.fatos)
    setTipoPeca(p.tipoPeca)
    setAreaDireito(p.areaDireito)
    setPeticao(p.peticao)
    setTela("peticoes")
  }

  async function logout() {
    await supabase.auth.signOut()
  }
  if (!usuario) return <Login />
  return (

    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
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
              <p className="text-xs text-zinc-500 tracking-widest mt-1">INTELIGÊNCIA JURÍDICA</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <span className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Principal</span>
          <button onClick={() => setTela("dashboard")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${tela === "dashboard" ? "bg-yellow-600/10 text-yellow-500" : "text-zinc-400 hover:bg-zinc-800"}`}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button onClick={() => setTela("peticoes")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${tela === "peticoes" ? "bg-yellow-600/10 text-yellow-500" : "text-zinc-400 hover:bg-zinc-800"}`}>
            <FileText size={16} /> Petições
          </button>
          <button onClick={() => setTela("historico")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${tela === "historico" ? "bg-yellow-600/10 text-yellow-500" : "text-zinc-400 hover:bg-zinc-800"}`}>
            <History size={16} /> Histórico
          </button>

          <span className="text-xs text-zinc-600 uppercase tracking-widest mb-2 mt-4">Gestão</span>
          <button onClick={() => setTela("prazos")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${tela === "prazos" ? "bg-yellow-600/10 text-yellow-500" : "text-zinc-400 hover:bg-zinc-800"}`}>
            <Clock size={16} /> Prazos
          </button>
          <button onClick={() => setTela("multas")} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${tela === "multas" ? "bg-yellow-600/10 text-yellow-500" : "text-zinc-400 hover:bg-zinc-800"}`}>
            <AlertTriangle size={16} /> Multas
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 text-sm hover:bg-zinc-800 transition-colors">
            <Folder size={16} /> Processos
          </button>
        </nav>
        <div className="mt-auto pt-4 border-t border-zinc-700">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 mb-2">
            <p className="text-xs text-zinc-400 font-semibold truncate">{usuario?.email}</p>
            <p className="text-xs text-zinc-600 mt-0.5">Plano Gratuito</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut size={14} /> Sair da conta
          </button>
        </div>

      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {tela === "dashboard" && (
          <>
            <h2 className="text-3xl font-bold text-zinc-100">Dashboard</h2>
            <p className="text-zinc-500 mt-1">Bem-vindo ao Themis</p>
            <div className="grid grid-cols-4 gap-4 mt-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Petições geradas</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">{totalPeticoes}</p>
                <p className="text-xs text-green-500 mt-1">Total salvo no Histórico</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Prazos ativos</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">{totalPrazos}</p>
                <p className="text-xs text-orange-400 mt-1">⚠ 2 urgentes</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Taxa de êxito</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">73%</p>
                <p className="text-xs text-green-500 mt-1">↑ Baseado em 34 casos</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Julgados consultados</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">210</p>
                <p className="text-xs text-zinc-500 mt-1">STJ · TJSP · STF</p>
              </div>
            </div>
          </>
        )}

        {tela === "peticoes" && (
          <>
            <h2 className="text-3xl font-bold text-zinc-100">Petições</h2>
            <p className="text-zinc-500 mt-1">Gere peças jurídicas com IA</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6">
              <h3 className="text-lg font-bold text-zinc-100 mb-4">⚖️ Gerador de Petição</h3>
              <Disclaimer tipo="peticao" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Tipo de Peça</p>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-100" value={tipoPeca} onChange={(e) => setTipoPeca(e.target.value)}>
                    <option>Petição Inicial</option>
                    <option>Contestação</option>
                    <option>Recurso de Apelação</option>
                    <option>Agravo de Instrumento</option>
                    <option>Embargos de Declaração</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Área do Direito</p>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-100" value={areaDireito} onChange={(e) => setAreaDireito(e.target.value)}>
                    <option>Direito Civil</option>
                    <option>Direito do Consumidor</option>
                    <option>Direito Trabalhista</option>
                    <option>Direito Penal</option>
                    <option>Direito de Família</option>
                  </select>
                </div>
              </div>
              {/* =========================================================
                DADOS ESPECÍFICOS DO DIREITO TRABALHISTA
                Esses campos só aparecem quando a área selecionada
                for "Direito Trabalhista".
                ========================================================= */}
              {areaDireito === "Direito Trabalhista" && (
                <div className="mt-6 p-5 rounded-xl border border-zinc-700 bg-zinc-900/50">

                  {/* Título da seção */}
                  <h3 className="text-sm font-semibold text-yellow-500 uppercase tracking-widest mb-4">
                    Dados do Trabalhador
                  </h3>

                  {/* Campos organizados em duas colunas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Nome completo */}
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
                        Nome completo
                      </label>

                      <input
                        type="text"
                        value={dadosTrabalhistas.nomeTrabalhador}
                        onChange={(e) =>
                          setDadosTrabalhistas({
                            ...dadosTrabalhistas,
                            nomeTrabalhador: e.target.value
                          })
                        }
                        placeholder="Ex: João da Silva"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                      />
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
                        CPF
                      </label>

                      <input
                        type="text"
                        value={dadosTrabalhistas.cpf}
                        onChange={(e) =>
                          setDadosTrabalhistas({
                            ...dadosTrabalhistas,
                            cpf: e.target.value
                          })
                        }
                        placeholder="Ex: 000.000.000-00"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                      />
                    </div>

                    {/* Cargo */}
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
                        Cargo / função
                      </label>

                      <input
                        type="text"
                        value={dadosTrabalhistas.cargo}
                        onChange={(e) =>
                          setDadosTrabalhistas({
                            ...dadosTrabalhistas,
                            cargo: e.target.value
                          })
                        }
                        placeholder="Ex: Auxiliar administrativo"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                      />
                    </div>

                    {/* Salário */}
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
                        Último salário
                      </label>

                      <input
                        type="number"
                        value={dadosTrabalhistas.salario}
                        onChange={(e) =>
                          setDadosTrabalhistas({
                            ...dadosTrabalhistas,
                            salario: e.target.value
                          })
                        }
                        placeholder="Ex: 3000"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                      />
                    </div>

                  </div>
                </div>
              )}
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Descreva os fatos do caso</p>
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 h-36 resize-none"
                placeholder="Ex: Cliente adquiriu produto com defeito em 10/01/2025..."
                value={fatos}
                onChange={(e) => setFatos(e.target.value)}
              />
              <button onClick={gerarPeticao} disabled={carregando} className="mt-4 w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-zinc-950 font-bold py-3 rounded-lg text-sm transition-colors">
                {carregando ? "⏳ Gerando petição..." : "⚖️ Gerar Petição com IA"}
              </button>
              {peticao && (
                <div className="mt-6 bg-zinc-800 border border-zinc-700 rounded-lg p-5">
                  <p className="text-xs text-yellow-500 uppercase tracking-widest mb-3">✅ Petição gerada</p>
                  <div className="flex gap-3 mb-4">
                    <button onClick={exportarPDF} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">📄 Exportar PDF</button>
                    <button onClick={exportarWord} className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">📝 Exportar Word</button>
                  </div>
                  <div className="text-sm text-zinc-200 leading-relaxed prose prose-invert max-w-none">
                    <ReactMarkdown>{peticao}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {tela === "historico" && (
          <>
            <h2 className="text-3xl font-bold text-zinc-100">Histórico</h2>
            <p className="text-zinc-500 mt-1">Petições geradas anteriormente</p>
            <Historico onReabrir={reabrirPeticao} />
          </>
        )}

        {tela === "prazos" && (
          <>
            <h2 className="text-3xl font-bold text-zinc-100">Prazos</h2>
            <p className="text-zinc-500 mt-1">Gerencie seus prazos processuais</p>
            <Prazos />
          </>
        )}

        {tela === "multas" && (
          <>
            <h2 className="text-3xl font-bold text-zinc-100">Contestação de Multas</h2>
            <p className="text-zinc-500 mt-1">Gere recursos administrativos com IA</p>
            <Multas />
          </>
        )}
      </main>
    </div>
  )
}

export default App