import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Send, MessageCircle, Star } from "lucide-react";

const WA_LINK = "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20personalizado.%20Podem%20me%20ajudar?";

const Clock = ({ className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ramos = [
  "Restaurante",
  "Hamburgueria / Lanchonete",
  "Mercado / Supermercado",
  "Padaria / Confeitaria",
  "Food service / Delivery",
  "Indústria",
  "Comércio em geral",
  "Evento / Buffet",
  "Farmácia / Drogaria",
];

const ConversionSection = () => {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    ramo: "",
    mensagem: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const partes = [
      "Olá! Vim pelo site da PSR Embalagens.",
      "",
      "*Nome:* " + form.nome,
      "*Telefone:* " + form.telefone,
      ...(form.ramo ? ["*Ramo:* " + form.ramo] : []),
      "",
      "*Mensagem:*",
      form.mensagem,
    ];
    const msg = partes.join("\n");
    window.open("https://wa.me/5561993177107?text=" + encodeURIComponent(msg), "_blank");
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-background/10 text-background placeholder:text-background/40 border border-background/15 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <section id="contato" className="py-16 md:py-28 gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="container max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
              Fale Conosco
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-background">
              Solicite seu orçamento agora
            </h2>
            <p className="mt-4 text-background/60 max-w-xl mx-auto leading-relaxed">
              Preencha o formulário ou fale diretamente pelo WhatsApp. Respondemos em minutos!
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8 items-stretch">

            {/* Formulário — 3/5 */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:col-span-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome Completo *"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="tel"
                  placeholder="Telefone *"
                  required
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className={inputClass}
                />
              </div>

              <input
                type="text"
                list="ramos-list"
                placeholder="Ramo de atuação (opcional)"
                value={form.ramo}
                onChange={(e) => setForm({ ...form, ramo: e.target.value })}
                className={inputClass}
              />
              <datalist id="ramos-list">
                {ramos.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>

              <textarea
                placeholder="Descreva o que precisa (produtos, quantidades, etc.) *"
                required
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                className={`${inputClass} resize-none flex-1 min-h-[180px]`}
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/30"
              >
                <Send className="w-4 h-4" />
                Enviar Mensagem via WhatsApp
              </button>
            </form>

            {/* Cards — 2/5 */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-7 rounded-xl bg-background/10 border border-background/15 hover:bg-background/15 transition-all group"
              >
                <MessageCircle className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-bold font-display text-background text-xl">WhatsApp Direto</h3>
                <p className="text-background/60 text-base mt-1">(61) 99317-7107</p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Iniciar conversa <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>

              <div className="p-7 rounded-xl bg-background/10 border border-background/15">
                <Clock className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-bold font-display text-background text-xl">Horário</h3>
                <div className="text-background/60 text-base mt-2 space-y-1">
                  <p>Segunda e Quinta: 5h às 17h</p>
                  <p>Terça, Quarta e Sexta: 6h às 17h</p>
                  <p>Sábado: 5h às 12h</p>
                  <p className="text-red-400 font-medium">Domingo: Fechado</p>
                </div>
              </div>

              <div className="p-7 rounded-xl bg-background/10 border border-background/15 flex-1">
                <Star className="w-7 h-7 text-accent mb-3 fill-accent" />
                <h3 className="font-bold font-display text-background text-xl">4.9 no Google</h3>
                <p className="text-background/60 text-base mt-1">+40 avaliações de clientes reais</p>
                <a
                  href="https://www.google.com/search?q=psr+embalagens+brasilia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-2 inline-block font-semibold"
                >
                  Ver avaliações →
                </a>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConversionSection;