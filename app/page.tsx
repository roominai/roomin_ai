"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
// import Header from "../components/Header"; // Mantendo o header como um componente separado é uma boa prática.
// import SquigglyLines from "../components/SquigglyLines"; // Pode ser usado se quisermos um efeito específico.
// import TypewriterEffect from "../components/TypewriterEffect"; // Pode ser usado para um efeito de texto.
// import ImageCarousel from "../components/ImageCarousel"; // Pode ser usado para mostrar exemplos.
import { motion } from "framer-motion"; // Para animações sutis.
// import "../styles/nubank-inspired.css"; // Vamos refatorar o CSS global em vez de usar um tema específico aqui.

// Importe componentes e estilos conforme necessário para o novo layout.
// Ex: import HeroSection from "../components/HeroSection";
// Ex: import FeaturesSection from "../components/FeaturesSection";
// Ex: import CTABanner from "../components/CTABanner";

export default function HomePage() {
  // Define as variantes de animação para framer-motion
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    // Usando uma estrutura flex para garantir que o footer fique no final
    <div className="flex flex-col min-h-screen">
      {/* Pode incluir um Header aqui se mantido como componente */}
      {/* <Header /> */}

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-4 py-16 md:py-24">
        <motion.section
          className="text-center mb-16 md:mb-24"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-gray-900">
            Transforme seus espaços com <br />
            <span className="text-blue-600">Inteligência Artificial</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10">
            Visualize o potencial da sua casa ou escritório com um clique. Nossa IA cria designs de interiores incríveis para qualquer ambiente.
          </p>
          {/* Call to Action Buttons */}
          <div className="flex justify-center gap-4">
            {/* Link para a página de geração (Dream) */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dream"
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
              >
                Experimentar Agora
              </Link>
            </motion.div>
            {/* Link para a página de Créditos */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              className="text-center mb-16"
 <Link
                href="/creditos" // Link para a página de Créditos
                className="text-blue-600 bg-white border border-blue-600 font-semibold px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition duration-300"
              >
                Ver Planos de Crédito
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works Section (Simplified) */}
        <motion.section
          className="py-16 md:py-24 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={staggerContainer}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">É simples e rápido transformar seu ambiente em 3 passos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <motion.div className="text-center p-6 rounded-lg bg-white shadow-sm" variants={fadeIn}>
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Envie sua Foto</h3>
              <p className="text-gray-600">Faça upload de uma imagem do ambiente que deseja transformar.</p>
            </motion.div>
            {/* Step 2 */}
            <motion.div className="text-center p-6 rounded-lg bg-white shadow-sm" variants={fadeIn}>
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Escolha um Estilo</h3>
              <p className="text-gray-600">Selecione o estilo de decoração que mais lhe agrada.</p>
            </motion.div>
            {/* Step 3 */}
            <motion.div className="text-center p-6 rounded-lg bg-white shadow-sm" variants={fadeIn}>
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Veja a Mágica Acontecer</h3>
              <p className="text-gray-600">Receba o novo design do seu ambiente em segundos!</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Example Images Section (Optional - using simple Images for now) */}
        <motion.section
          className="py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Inspire-se</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">Veja alguns exemplos de transformações criadas pela nossa IA.</p>
          </div>
          {/* Simple grid of images - could replace with Carousel component */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <motion.div className="rounded-lg overflow-hidden shadow-md" variants={fadeIn}>
              <Image
                src="/generated-pic-2.jpg" // Substitua por imagens de exemplo reais
                alt="Exemplo de ambiente transformado"
                width={600}
                height={400}
                objectFit="cover"
                className="w-full h-auto" // Make image responsive
              />
            </motion.div>
            <motion.div className="rounded-lg overflow-hidden shadow-md" variants={fadeIn}>
              <Image
                src="/generated-pic.png" // Substitua por imagens de exemplo reais
                alt="Exemplo de ambiente transformado"
                width={600}
                height={400}
                objectFit="cover"
                className="w-full h-auto" // Make image responsive
              />
            </motion.div>
            <motion.div className="rounded-lg overflow-hidden shadow-md" variants={fadeIn}>
              <Image
                src="/original-pic.jpg" // Substitua por imagens de exemplo reais
                alt="Exemplo de ambiente original"
                width={600}
                height={400}
                objectFit="cover"
                className="w-full h-auto" // Make image responsive
              />
            </motion.div>
            {/* Adicione mais exemplos conforme necessário */}
          </div>
        </motion.section>

        {/* Final Call to Action Section */}
        <motion.section
          className="py-16 md:py-24 text-center bg-blue-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comece a Transformar Seu Espaço Hoje!</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">É rápido, fácil e o futuro do design de interiores.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/dream"
              className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
            >
              Criar Meu Design Agora
            </Link>
          </motion.div>
        </motion.section>
      </main>

      <Footer /> {/* Incluindo o Footer aqui */}
    </div>
  );
}
