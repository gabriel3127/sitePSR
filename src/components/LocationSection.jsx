import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";

const LocationSection = () => {
  return (
    <section id="localizacao" className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Nossa Localização
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground">
            Visite nossa loja no CEASA
          </h2>
          <p className="mt-3 text-muted-foreground">
            Localização estratégica para atendimento rápido em todo o DF
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden shadow-elevated h-[400px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.8!2d-47.95!3d-15.82!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCEASA+Bras%C3%ADlia!5e0!3m2!1spt-BR!2sbr!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização PSR Embalagens no CEASA Brasília"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="p-6 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold font-display text-foreground text-lg">Endereço</h3>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    SIA Trecho 10, LOTE 05, PAV B-10B, BOX 07<br />
                    CEASA, Guará, Brasília - DF<br />
                    CEP: 71200-100
                  </p>
                  <a
                    href="https://maps.google.com/?q=CEASA+Brasilia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Abrir no Google Maps
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold font-display text-foreground text-lg">Horário de Funcionamento</h3>
                  <div className="text-muted-foreground mt-1 space-y-0.5 leading-relaxed">
                    <p>Segunda e Quinta: 5h às 17h</p>
                    <p>Terça, Quarta e Sexta: 6h às 17h</p>
                    <p>Sábado: 5h às 12h</p>
                    <p className="text-destructive font-medium">Domingo: Fechado</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold font-display text-foreground text-lg">Contato</h3>
                  <p className="text-muted-foreground mt-1">
                    <a href="tel:+5561993177107" className="text-primary font-semibold hover:underline text-lg">(61) 99317-7107</a>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">WhatsApp e ligações</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;