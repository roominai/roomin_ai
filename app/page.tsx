"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";
import TypewriterEffect from "../components/TypewriterEffect";

export default function HomePage() {
  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-20 mt-20 background-gradient">

      <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-gray-800 sm:text-7xl">
          Criando o ambiente dos sonhos{" "}
          <span className="relative whitespace-nowrap text-blue-600">
            <SquigglyLines />
            <span className="relative">usando IA</span>
          </span>{" "}
          para todos.
          </h1>
        <h2 className="mx-auto mt-12 max-w-xl text-lg text-gray-600 leading-7">
        Tire uma foto de um cômodo e veja como ele fica em diferentes temas.
        </h2>
        <Link
          className="bg-blue-600 rounded-xl text-white font-medium px-6 py-3 sm:mt-10 mt-8 hover:bg-blue-500 transition shadow-md hover:shadow-lg"
          href="/dream"
        >
          Redecorar agora
        </Link>
        <div className="flex justify-between items-center w-full flex-col sm:mt-10 mt-6">
          <div className="flex flex-col space-y-10 mt-8 mb-16">
            <div className="flex sm:space-x-8 sm:flex-row flex-col">
              <div className="card p-2">
                <h3 className="mb-3 font-medium text-lg text-gray-800">Imagem original</h3>
                <Image
                  alt="Original photo of a room with roomGPT.io"
                  src="/original-pic.jpg"
                  className="w-full object-cover h-96 rounded-xl"
                  width={400}
                  height={400}
                />
              </div>
              <div className="sm:mt-0 mt-8 card p-2">
                <h3 className="mb-3 font-medium text-lg text-gray-800">Imagem gerada</h3>
                <Image
                  alt="Generated photo of a room with roomGPT.io"
                  width={400}
                  height={400}
                  src="/generated-pic-2.jpg"
                  className="w-full object-cover h-96 rounded-xl sm:mt-0 mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
