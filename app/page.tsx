"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";
import TypewriterEffect from "../components/TypewriterEffect";
import ImageCarousel from "../components/ImageCarousel";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-20 mt-20 background-gradient">

      <h1 className="mx-auto max-w-4xl font-poppins text-5xl font-bold tracking-normal text-gray-800 sm:text-7xl">
          Criando o seu ambiente dos sonhos{" "}
          <span className="relative whitespace-nowrap text-blue-600">
            <SquigglyLines />
            <span className="relative">usando IA</span>
          </span>{" "}
          </h1>
        <h2 className="mx-auto mt-12 max-w-xl text-xl font-poppins text-gray-600 leading-7">
          Tire uma foto de um ambiente e veja como ele fica em diferentes temas.
        </h2>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white font-medium px-8 py-4 sm:mt-10 mt-8 hover:from-blue-500 hover:to-blue-400 transition duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            href="/dream"
          >
            <span className="font-poppins font-semibold">Redecorar agora</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
        <div className="flex justify-between items-center w-full flex-col sm:mt-10 mt-6">
          <div className="flex flex-col space-y-10 mt-8 mb-16">
            <div className="flex sm:space-x-8 sm:flex-row flex-col">
              <motion.div 
                className="card p-4 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="mb-3 font-poppins font-semibold text-lg text-gray-800 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                  Imagem original
                </h3>
                <div className="overflow-hidden rounded-lg">
                  <Image
                    alt="Original photo of a room with roomGPT.io"
                    src="/original-pic.jpg"
                    className="w-full object-cover h-96 rounded-lg transform transition-transform duration-500 hover:scale-105"
                    width={400}
                    height={400}
                  />
                </div>
              </motion.div>
              <motion.div 
                className="sm:mt-0 mt-8 card p-4 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="mb-3 font-poppins font-semibold text-lg text-gray-800 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                  Imagem gerada
                </h3>
                <div className="overflow-hidden rounded-lg">
                  <Image
                    alt="Generated photo of a room with roomGPT.io"
                    width={400}
                    height={400}
                    src="/generated-pic-2.jpg"
                    className="w-full object-cover h-96 rounded-lg transform transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>
          </div>
          
          <ImageCarousel 
            images={[
              { src: "/generated-pic-2.jpg", alt: "Sala Moderna" },
              { src: "/generated-pic.png", alt: "Quarto Minimalista" },
              { src: "/generatedpic.png", alt: "Cozinha Escandinava" },
              { src: "/original-pic.jpg", alt: "Ambiente Original" }
            ]}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
