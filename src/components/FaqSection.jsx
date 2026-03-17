import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const WA_LINK = "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20personalizado.%20Podem%20me%20ajudar?";

const faqs = [
  {
    q: "Vocês fazem entrega grátis em Brasília?",
    a: "Sim! Fazemos entrega grátis para todo o DF e entorno. A entrega é realizada em rotas diárias, sujeita à disponibilidade de horário e localização. Entre em contato para confirmar se sua região está na nossa rota.",
  },
  {
    q: "Qual o horário de funcionamento?",
    a: "Funcionamos de segunda a sexta das 5h às 17h e aos sábados das 5h às 12h. Domingos permanecemos fechados. Estamos localizados no CEASA.",
  },
  {
    q: "Vocês vendem embalagens para delivery?",
    a: "Sim! Temos uma linha completa de embalagens para delivery: marmitas, caixas para hambúrguer, sacolas kraft, garrafas e muito mais. Todos resistentes e mantêm a qualidade dos alimentos.",
  },
  {
    q: "Como posso fazer um orçamento?",
    a: "Você pode solicitar orçamento pelo WhatsApp (61) 99317-7107, pelo formulário de contato do site, ou visitando nossa loja no CEASA, Guará, Brasília-DF.",
  },
  {
    q: "Vocês têm embalagens biodegradáveis?",
    a: "Sim! Oferecemos uma linha completa de embalagens biodegradáveis e sustentáveis feitas de cana-de-açúcar e outros materiais ecológicos, sem abrir mão da qualidade.",
  },
  {
    q: "Qual a localização da PSR Embalagens?",
    a: "Estamos no SIA Trecho 10, LOTE 05, PAV B-10B, BOX 07, CEASA, Guará, Brasília - DF, CEP: 71200-100.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-muted">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Dúvidas Frequentes
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground">
            Perguntas e respostas
          </h2>
          <p className="mt-3 text-muted-foreground">
            Encontre respostas rápidas sobre nossos produtos e serviços
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card p-6 md:p-8"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-bold font-display text-foreground hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground mb-4">Não encontrou a resposta que procurava?</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Fale Conosco no WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;


