export default function Disclaimer({ tipo = "geral" }) {
  const textos = {
    geral: "Os documentos gerados pelo Themis são minutas de apoio jurídico e não substituem a orientação de um advogado habilitado.",
    multa: "Recursos à JARI e CETRAN podem ser protocolados por qualquer cidadão sem necessidade de advogado. Para ações judiciais, é obrigatória a assistência de advogado inscrito na OAB.",
    peticao: "As petições geradas são minutas que requerem revisão e assinatura de advogado inscrito na OAB para protocolo judicial.",
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 mt-4 flex gap-3 items-start">
      <span className="text-yellow-500 text-lg mt-0.5">⚠️</span>
      <div>
        <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">Aviso Legal</p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          O <strong className="text-zinc-300">Themis</strong> é uma ferramenta de apoio jurídico informacional. {textos[tipo]} Os documentos gerados não constituem consultoria jurídica, não estabelecem relação advogado-cliente e não representam o exercício da advocacia. O uso é de inteira responsabilidade do usuário. Para situações que exijam representação legal, consulte um advogado inscrito na <strong className="text-zinc-300">OAB</strong>.
        </p>
      </div>
    </div>
  )
}