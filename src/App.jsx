import { useState } from "react"
import ReactMarkdown from "react-markdown"
import jsPDF from "jspdf"
import Prazos from "./components/Prazos"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"

function App() {
  const [fatos, setFatos] = useState("")
  const [tipoPeca, setTipoPeca] = useState("Petição Inicial")
  const [areaDireito, setAreaDireito] = useState("Direito Civil")
  const [peticao, setPeticao] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function gerarPeticao() {
    if (!fatos.trim()) {
      alert("Descreva os fatos do caso antes de gerar a petição!")
      return
    }
    setCarregando(true)
    setPeticao("")
    try {
      const resposta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
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
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1800,
            },
          },
        },
        children: paragrafos,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, "peticao-themis.docx")
}

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-yellow-600 tracking-widest">THEMIS</h1>
          <p className="text-xs text-zinc-500 tracking-widest mt-1">INTELIGÊNCIA JURÍDICA</p>
        </div>
        <nav className="flex flex-col gap-2">
          <span className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Principal</span>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-yellow-600/10 text-yellow-500 text-sm">⚖️ Dashboard</button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 text-sm hover:bg-zinc-800">📄 Petições</button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 text-sm hover:bg-zinc-800">🔍 Jurisprudência</button>
          <span className="text-xs text-zinc-600 uppercase tracking-widest mb-1 mt-4">Gestão</span>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 text-sm hover:bg-zinc-800">📅 Prazos</button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 text-sm hover:bg-zinc-800">📁 Processos</button>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <h2 className="text-3xl font-bold text-zinc-100">Dashboard</h2>
        <p className="text-zinc-500 mt-1">Bem-vindo ao Themis</p>

        <div className="grid grid-cols-4 gap-4 mt-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Petições geradas</p>
            <p className="text-4xl font-bold text-yellow-500 mt-2">47</p>
            <p className="text-xs text-green-500 mt-1">↑ 12 este mês</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Prazos ativos</p>
            <p className="text-4xl font-bold text-yellow-500 mt-2">8</p>
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-bold text-zinc-100 mb-4">⚖️ Gerador de Petição</h3>
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
                <button onClick={exportarPDF} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                  📄 Exportar PDF
                </button>
                <button onClick={exportarWord} className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                  📝 Exportar Word
                </button>
              </div>
              <div className="text-sm text-zinc-200 leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown>{peticao}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <Prazos />
      </main>
    </div>
  )
}

export default App