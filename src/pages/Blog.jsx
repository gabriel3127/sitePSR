import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import psrLogo from "@/assets/psr-logo.svg";

import productBio from "@/assets/product-bio.jpg";
import productDescartaveis from "@/assets/product-descartaveis.jpg";
import productLanchonete from "@/assets/product-lanchonete.jpg";
import productMercado from "@/assets/product-mercado.jpg";
import productFesta from "@/assets/product-festa.jpg";
import productLimpeza from "@/assets/product-limpeza.webp";

const posts = [
  {
    id: "embalagens-biodegradaveis-2025",
    title: "Embalagens Biodegradáveis: O Futuro Sustentável do Seu Negócio",
    excerpt: "Descubra como embalagens biodegradáveis podem reduzir custos e melhorar a imagem da sua marca junto aos consumidores conscientes.",
    category: "Sustentabilidade",
    date: "10 Mar 2025",
    readTime: "5 min",
    image: productBio,
    content: `As embalagens biodegradáveis estão revolucionando o mercado. Feitas de materiais como cana-de-açúcar, amido de milho e fibras naturais, elas se decompõem em até 180 dias.\n\n**Benefícios para o seu negócio:**\n- Redução de até 30% nos custos com descarte\n- Imagem positiva junto ao consumidor\n- Conformidade com legislação ambiental\n- Diferenciação competitiva\n\nNa PSR Embalagens oferecemos uma linha completa de produtos biodegradáveis. Entre em contato e solicite um orçamento!`,
  },
  {
    id: "como-escolher-embalagem-delivery",
    title: "Como Escolher a Embalagem Ideal para Delivery",
    excerpt: "Guia completo para hamburguerias e lanchonetes escolherem embalagens que mantêm a qualidade dos alimentos.",
    category: "Dicas",
    date: "28 Fev 2025",
    readTime: "4 min",
    image: productLanchonete,
    content: `A embalagem certa faz toda a diferença no delivery. Um hambúrguer que chega murcho ou um lanche frio pode significar a perda de um cliente.\n\n**Critérios essenciais:**\n1. **Isolamento térmico** — Mantenha a temperatura do alimento\n2. **Resistência** — Evite vazamentos e deformações\n3. **Ventilação** — Produtos fritos precisam de respiro\n4. **Apresentação** — A embalagem é o primeiro contato visual\n\nA PSR Embalagens tem soluções específicas para cada tipo de alimento. Consulte nosso catálogo!`,
  },
  {
    id: "organizacao-estoque-mercados",
    title: "Organização de Estoque: Embalagens Essenciais para Mercados",
    excerpt: "As embalagens que todo mercado e açougue precisa ter no estoque para não perder vendas.",
    category: "Negócios",
    date: "15 Fev 2025",
    readTime: "3 min",
    image: productMercado,
    content: `Manter o estoque de embalagens organizado é fundamental para o funcionamento do seu mercado.\n\n**Itens indispensáveis:**\n- Bandejas de isopor para carnes e frios\n- Filmes PVC e stretch\n- Sacolas plásticas em vários tamanhos\n- Etiquetas e bobinas para balanças\n- Sacos a vácuo para frios\n\nCom a PSR Embalagens você tem entrega rápida no DF e região. Nunca mais fique sem estoque!`,
  },
  {
    id: "embalagens-festas-eventos",
    title: "Planejando uma Festa? Veja que Você Precisa",
    excerpt: "Lista completa de utensílios descartáveis para festas e eventos de qualquer tamanho.",
    category: "Dicas",
    date: "5 Fev 2025",
    readTime: "4 min",
    image: productFesta,
    content: `Organizar uma festa exige planejamento, e são parte essencial.\n\n**Checklist de embalagens para festas:**\n- Pratos descartáveis (raso e fundo)\n- Copos de 200ml e 300ml\n- Talheres descartáveis\n- Guardanapos\n- Toalhas de mesa\n- Embalagens para docinhos\n- Sacos para lembrancinhas\n\nNa PSR Embalagens você encontra tudo em um só lugar com os melhores preços!`,
  },
  {
    id: "higiene-estabelecimento-comercial",
    title: "Higiene no Estabelecimento: Produtos Essenciais",
    excerpt: "Conheça os produtos de higiene e limpeza profissional que todo estabelecimento precisa.",
    category: "Negócios",
    date: "20 Jan 2025",
    readTime: "3 min",
    image: productLimpeza,
    content: `A higiene é requisito obrigatório para qualquer estabelecimento alimentício.\n\n**Produtos essenciais:**\n- Detergente neutro e desengordurante\n- Álcool 70%\n- Papel toalha interfolhado\n- Sabonete líquido\n- Sacos de lixo reforçados\n- Luvas descartáveis\n\nA PSR Embalagens oferece toda a linha de higiene e limpeza profissional. Consulte!`,
  },
  {
    id: "reducao-custos-embalagens",
    title: "5 Dicas para Reduzir Custos com Embalagens no Seu Negócio",
    excerpt: "Estratégias práticas para economizar sem perder qualidade nas embalagens do seu estabelecimento.",
    category: "Negócios",
    date: "10 Jan 2025",
    readTime: "5 min",
    image: productDescartaveis,
    content: `Embalagens representam um custo significativo para qualquer negócio alimentício.\n\n**Dicas para economizar:**\n1. **Compre em quantidade** — Negocie descontos por volume\n2. **Padronize tamanhos** — Menos variedade = mais economia\n3. **Escolha o material certo** — Nem sempre o mais caro é o melhor\n4. **Evite desperdício** — Treine a equipe no uso correto\n5. **Parceiro confiável** — Tenha um fornecedor com preços justos\n\nA PSR Embalagens é parceira de mais de 500 estabelecimentos no DF. Fale conosco!`,
  },
];

const blogCategories = ["Todos", "Sustentabilidade", "Dicas", "Negócios"];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedPost, setSelectedPost] = useState(null);

  const filtered = activeCategory === "Todos"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="container flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src={psrLogo} alt="PSR Embalagens" className="h-10" />
            </Link>
            <button
              onClick={() => setSelectedPost(null)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao blog
            </button>
          </div>
        </header>
        <article className="container max-w-3xl py-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-sm font-medium text-primary">{selectedPost.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{selectedPost.title}</h1>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {selectedPost.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedPost.readTime} de leitura</span>
            </div>
            <img src={selectedPost.image} alt={selectedPost.title} className="w-full rounded-lg mt-8 aspect-video object-cover" />
            <div className="mt-8 prose prose-lg max-w-none text-foreground">
              {selectedPost.content.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <h3 key={i} className="text-xl font-bold text-foreground mt-6 mb-3">{line.replace(/\*\*/g, "")}</h3>;
                }
                if (line.startsWith("- ")) {
                  return <li key={i} className="text-muted-foreground ml-4">{line.slice(2)}</li>;
                }
                if (line.match(/^\d+\./)) {
                  return <li key={i} className="text-muted-foreground ml-4 list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>;
              })}
            </div>
          </motion.div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={psrLogo} alt="PSR Embalagens" className="h-10" />
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Voltar ao site
          </Link>
        </div>
      </header>

      <div className="container py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Blog PSR Embalagens</h1>
          <p className="mt-2 text-muted-foreground">Dicas, novidades e conteúdo sobre embalagens e negócios</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {blogCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedPost(post)}
              className="bg-card rounded-lg shadow-card overflow-hidden cursor-pointer group hover:-translate-y-1 hover:shadow-card-hover transition-all duration-250"
            >
              <div className="aspect-video overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {post.category}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                </div>
                <h2 className="font-semibold text-foreground text-lg leading-tight">{post.title}</h2>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                <span className="inline-block mt-3 text-sm font-semibold text-primary group-hover:underline">
                  Ler mais →
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;