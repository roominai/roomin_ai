// app/page.tsx
import React from 'react';
import Image from 'next/image';
import './style.css';
import './index.css';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">
            {/* Logo Placeholder */}
            Redecora
          </div>
          <nav className="space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">Home</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Serviços</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Portfólio</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: 'url(/placeholder-hero.jpg)' }} // Placeholder image
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-6 h-full flex items-center justify-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Transforme seu espaço com estilo
          </h1>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nossos Serviços</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl text-blue-600 mb-4">
                {/* Icon Placeholder */}
                🛋️
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Design de Interiores</h3>
              <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            {/* Service Card 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl text-green-600 mb-4">
                {/* Icon Placeholder */}
                💡
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Consultoria Online</h3>
              <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            {/* Service Card 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl text-purple-600 mb-4">
                {/* Icon Placeholder */}
                🎨
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Decoração Personalizada</h3>
              <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 bg-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nosso Portfólio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Portfolio Item 1 */}
            <div className="relative group overflow-hidden rounded-lg shadow-md">
              <Image
                src="/placeholder-portfolio-1.jpg" // Placeholder image
                alt="Projeto de Interiores 1"
                width={500}
                height={300}
                className="w-full h-48 object-cover transition duration-300 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-70 transition duration-300 flex items-center justify-center">
                <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition duration-300">Projeto 1</span>
              </div>
            </div>
            {/* Portfolio Item 2 */}
            <div className="relative group overflow-hidden rounded-lg shadow-md">
              <Image
                src="/placeholder-portfolio-2.jpg" // Placeholder image
                alt="Projeto de Interiores 2"
                width={500}
                height={300}
                className="w-full h-48 object-cover transition duration-300 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-70 transition duration-300 flex items-center justify-center">
                <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition duration-300">Projeto 2</span>
              </div>
            </div>
            {/* Portfolio Item 3 */}
            <div className="relative group overflow-hidden rounded-lg shadow-md">
              <Image
                src="/placeholder-portfolio-3.jpg" // Placeholder image
                alt="Projeto de Interiores 3"
                width={500}
                height={300}
                className="w-full h-48 object-cover transition duration-300 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-70 transition duration-300 flex items-center justify-center">
                <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition duration-300">Projeto 3</span>
              </div>
            </div>
            {/* Add more portfolio items as needed */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-4">
            <p>Informações de Contato Placeholder</p>
            <p>Email: info@redecora.com</p>
            <p>Telefone: (XX) XXXX-XXXX</p>
          </div>
          <div className="space-x-4">
            {/* Social Media Links Placeholder */}
            <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
          </div>
          <div className="mt-8 text-gray-400">
            &copy; 2023 Redecora. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};