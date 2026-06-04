import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"

export function salvarPeticaoNoHistorico({ tipoPeca, areaDireito, fatos, peticao }) {
  const historico = JSON.parse(localStorage.getItem("themis_historico") || "[]")
  const nova = {
    id: Date.now(),
    data: new Date().toLocaleDateString("pt-BR"),
    hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    tipoPeca,
    areaDireito,
    fatos,
    peticao,
  }
  historico.unshift(nova)
  localStorage.setItem("themis_historico", JSON.stringify(historico))
}

export default function Historico({ onReabrir }) {
  const [historico, setHistorico] = useState([])
  const [selecionada, setSelecionada] = useState(null)

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("themis_historico") || "[]")
    setHistorico(dados)
  }, [])

  function excluir(id) {
    const novo = historico.filter((p) => p.id !== id)
    localStorage.setItem("themis_historico", JSON.stringify(novo))
    setHistorico(novo)
    if (selecionada?.id === id) setSelecionada(null)
  }

  function exportarPDF(p) {
    const doc = new jsPDF()
    doc.setFont("times", "normal")
    doc.setFontSize(11)
    const linhas = doc.splitTextToSize(p.peticao, 180)
    let y = 20
    linhas.forEach((linha) => {
      if (y + 7 > 270) { doc.addPage(); y = 20 }
      doc.text(linha, 15, y)
      y += 7
    })
    doc.save(`peticao-themis-${p.id}.pdf`)
  }

  async function exportarWord(p) {
    const paragrafos = p.peticao.split("\n").map((linha) =>
      new Paragraph({
        children: [new TextRun({ text: linha, size: 24, font: "Times New Roman" })],
        spacing: { after: 200 },
      })
    )
    const doc = new Document({
      sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 } } }, children: paragrafos }],
    })
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `peticao-themis-${p.id}.docx`)
  }

  if (historico.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
        <p className="text-5xl mb-4">📂</p>
        <p className="text-sm">Nenhuma petição salva ainda.</p>
        <p className="text-xs mt-1">Gere uma petição para ela aparecer aqui.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6 mt-6">
      <div className="w-80 flex flex-col gap-3 flex-shrink-0">
        {historico.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelecionada(p)}
            className={`bg-zinc-900 border rounded-xl p-4 cursor-pointer transition-all ${
              selecionada?.id === p.id ? "border-yellow-600" : "border-zinc-800 hover:border-zinc-600"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-zinc-100">{p.tipoPeca}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{p.areaDireito}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); excluir(p.id) }}
                className="text-zinc-600 hover:text-red-500 text-xs transition-colors"
              >✕</button>
            </div>
            <p className="text-xs text-zinc-600 mt-2 line-clamp-2">{p.fatos}</p>
            <p className="text-xs text-zinc-700 mt-2">{p.data} às {p.hora}</p>
          </div>
        ))}
      </div>

      <div className="flex-1">
        {selecionada ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-lg font-bold text-zinc-100">{selecionada.tipoPeca}</p>
                <p className="text-xs text-zinc-500">{selecionada.areaDireito} · {selecionada.data} às {selecionada.hora}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onReabrir(selecionada)} className="bg-yellow-600 hover:bg-yellow-500 text-zinc-950 font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                  ✏️ Reabrir no editor
                </button>
                <button onClick={() => exportarPDF(selecionada)} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                  📄 PDF
                </button>
                <button onClick={() => exportarWord(selecionada)} className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                  📝 Word
                </button>
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {selecionada.peticao}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            Selecione uma petição para visualizar
          </div>
        )}
      </div>
    </div>
  )
}