"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";
import TypewriterEffect from "../components/TypewriterEffect";
import ImageCarousel from "../components/ImageCarousel";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import "../styles/nubank-inspired.css";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Background Elements */}
      <div className="blurred-spots-background">
        <div className="blur-spot blur-spot-1"></div>
        <div className="blur-spot blur-spot-2"></div>
        <div className="blur-spot blur-spot-3"></div>
        <div className="blur-spot blur-spot-4"></div>
        <div className="blur-spot blur-spot-5"></div>
      </div>

      <Header />

      {/* Hero Section */}
      <main className="flex-1 w-full">
        <section className="relative overflow-hidden py-20 md:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              variants={fadeIn}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-block mb-4 px-4 py-1 rounded-full bg-purple-50 text-purple-600 font-medium text-sm nubank-badge">
                ✨ Transforme seu ambiente com IA
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-900">
                Redesenhe seus espaços com
                <span className="relative whitespace-nowrap block mt-2">
                  <span className="text-purple-700">inteligência artificial</span>
                  <SquigglyLines />
                </span>
              </h1>
              
              <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
                Transforme qualquer ambiente com um clique. Tire uma foto e veja seu espaço ganhar vida em diversos estilos incríveis instantaneamente.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-1/2 max-w-xs"
                >
                  <Link
                    href="/dream"
                    className="w-full relative overflow-hidden group flex items-center justify-center gap-2 nubank-button px-8 py-4 transition-all duration-300"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative z-10 font-semibold">Começar agora</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-1/2 max-w-xs"
                >
                  <Link
                    href="/creditos"
                    className="w-full flex items-center justify-center gap-2 bg-white text-purple-700 font-medium rounded-xl px-8 py-4 border border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300"
                  >
                    <span>Ver planos</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Floating Cards Section */}
            <motion.div
              className="relative mt-20"
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-full max-w-lg h-20 bg-gradient-to-r from-purple-500/10 to-purple-300/10 filter blur-3xl rounded-full"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <motion.div 
                  className="nubank-card group p-6 hover:shadow-xl transition-all duration-500 nubank-glow"
                  variants={fadeIn}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  {/* Número removido */}
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">📸</span> Capture seu ambiente
                  </h3>
                  
                  <p className="text-gray-600 mb-6">Tire uma foto do seu espaço atual usando seu smartphone ou faça upload de uma imagem existente.</p>
                  
                  <div className="overflow-hidden rounded-xl shadow-lg">
                    <Image
                      alt="Foto original de um ambiente"
                      src="/original-pic.jpg"
                      className="w-full h-64 object-cover transform transition-all duration-700 group-hover:scale-105"
                      width={500}
                      height={300}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="nubank-card group p-6 hover:shadow-xl transition-all duration-500 nubank-glow"
                  variants={fadeIn}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100, delay: 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  {/* Número removido */}
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">✨</span> Veja a transformação
                  </h3>
                  
                  <p className="text-gray-600 mb-6">Nossa IA transforma seu ambiente instantaneamente em diversos estilos de decoração.</p>
                  
                  <div className="overflow-hidden rounded-xl shadow-lg">
                    <Image
                      alt="Imagem gerada pela IA"
                      src="/generated-pic-2.jpg"
                      className="w-full h-64 object-cover transform transition-all duration-700 group-hover:scale-105"
                      width={500}
                      height={300}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="relative py-20 px-4 bg-white">
          <div className="absolute bottom-0 left-0 w-full overflow-hidden">
            <Image
              src="/wave-pattern.svg"
              alt="Wave pattern"
              width={1440}
              height={320}
              className="w-full"
            />
          </div>
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-purple-700">Ambientes Transformados</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Veja como nossa tecnologia pode transformar qualquer ambiente</p>
            </motion.div>
            
            <div className="mt-10">
              <ImageCarousel 
                images={[
                  { src: "/generated-pic-2.jpg", alt: "Sala Moderna" },
                  { src: "/generated-pic.png", alt: "Quarto Minimalista" },
                  { src: "/generatedpic.png", alt: "Cozinha Escandinava" },
                  { src: "/original-pic.jpg", alt: "Ambiente Original" }
                ]}
              />
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div 
                className="nubank-glass p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                variants={fadeIn}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Rápido e Instantâneo</h3>
                <p className="text-gray-600">Resultados em segundos, sem espera. Transforme seu ambiente com apenas um clique.</p>
              </motion.div>
              
              <motion.div 
                className="nubank-glass p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                variants={fadeIn}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Múltiplos Estilos</h3>
                <p className="text-gray-600">Escolha entre diversos estilos de decoração para encontrar o que combina com você.</p>
              </motion.div>
              
              <motion.div 
                className="nubank-glass p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                variants={fadeIn}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Seguro e Privado</h3>
                <p className="text-gray-600">Suas imagens são processadas com segurança e nunca compartilhadas sem sua permissão.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto nubank-border rounded-2xl text-center">
              <div className="nubank-border-content p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 nubank-highlight">Pronto para transformar seu espaço?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Comece agora mesmo e veja a magia acontecer em segundos.</p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dream"
                  className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 font-bold rounded-xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span>Experimentar agora</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
              </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
