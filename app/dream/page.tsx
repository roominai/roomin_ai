"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UrlBuilder } from "@bytescale/sdk";
import { UploadWidgetConfig } from "@bytescale/upload-widget";
import { UploadDropzone } from "@bytescale/upload-widget-react";
import { CompareSlider } from "../../components/CompareSlider";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LoadingDots from "../../components/LoadingDots";
import ResizablePanel from "../../components/ResizablePanel";
import Toggle from "../../components/Toggle";
import appendNewToName from "../../utils/appendNewToName";
import downloadPhoto from "../../utils/downloadPhoto";
import DropDown from "../../components/DropDown";
import { roomType, rooms, themeType, themes } from "../../utils/dropdownTypes";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../supabaseClient";

const options: UploadWidgetConfig = {
  apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      : "free",
  maxFileCount: 1,
  mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  editor: { images: { crop: false } },
  locale: {
    // Tradução dos textos para português
    uploadImage: "Enviar uma Imagem",
    orDragDropImage: "...ou arraste e solte uma imagem",
    addAnotherFile: "Adicionar Outro Arquivo",
    addAnotherImage: "Adicionar Outra Imagem",
    cancel: "Cancelar",
    cancelInPreviewWindow: "Cancelar",
    cancelled: "Cancelado!",
    continue: "Continuar",
    crop: "Recortar",
    customValidationFailed: "Validação personalizada falhou",
    done: "Concluído",
    error: "Erro!",
    finish: "Finalizar",
    finishIcon: true,
    image: "Imagem",
    maxFilesReached: "Número máximo de arquivos:",
    maxImagesReached: "Número máximo de imagens:",
    maxSize: "Tamanho máximo do arquivo:",
    next: "Próximo",
    of: "de",
    orDragDropFile: "...ou arraste e solte um arquivo",
    orDragDropFiles: "...ou arraste e solte arquivos",
    orDragDropImages: "...ou arraste e solte imagens",
    pleaseWait: "Por favor, aguarde...",
    processingFile: "Processando arquivo...",
    remove: "Remover",
    removed: "Removido!",
    skip: "Pular",
    unsupportedFileType: "Tipo de arquivo não suportado",
    uploadFile: "Enviar um Arquivo",
    uploadFiles: "Enviar Arquivos",
    uploadImages: "Enviar Imagens"
  },
  styles: {
    colors: {
      primary: "#2563EB", // Primary buttons & links
      error: "#d23f4d", // Error messages
      shade100: "#fff", // Standard text
      shade200: "#fffe", // Secondary button text
      shade300: "#fffd", // Secondary button text (hover)
      shade400: "#808080", // Welcome text (alterado para cinza)
      shade500: "#fff9", // Modal close button
      shade600: "#fff7", // Border
      shade700: "#fff2", // Progress indicator background
      shade800: "#fff1", // File item background
      shade900: "#ffff", // Various (draggable crop buttons, etc.)
    },
  },
};

export default function DreamPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [theme, setTheme] = useState<themeType>("Modern");
  const [room, setRoom] = useState<roomType>("Living Room");
  const [credits, setCredits] = useState<number>(0);
  
  // Redirecionar para a página de login se o usuário não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      // Buscar créditos do usuário
      fetchUserCredits();
    }
  }, [user, authLoading, router]);
  
  // Função para buscar créditos do usuário
  const fetchUserCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      setCredits(data?.credits || 0);
    } catch (error) {
      console.error('Erro ao buscar créditos:', error);
    }
  };

  // Componente de upload de imagem
  const UploadDropZone = () => (
    <UploadDropzone
      options={options}
      onUpdate={({ uploadedFiles }) => {
        if (uploadedFiles.length !== 0) {
          const image = uploadedFiles[0];
          const imageName = image.originalFile.originalFileName;
          const imageUrl = UrlBuilder.url({
            accountId: image.accountId,
            filePath: image.filePath,
            options: {
              transformation: "preset",
              transformationPreset: "thumbnail"
            }
          });
          setPhotoName(imageName);
          setOriginalPhoto(imageUrl);
          generatePhoto(imageUrl);
        }
      }}
      width="670px"
      height="250px"
    />
  );

  async function generatePhoto(fileUrl: string) {
    // Verificar se o usuário tem créditos suficientes
    if (credits <= 0) {
      setError("Você não tem créditos suficientes para gerar uma imagem. Adquira créditos para continuar.");
      setLoading(false);
      return;
    }
    
    await new Promise((resolve) => setTimeout(resolve, 200));
    setLoading(true);
    const res = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        imageUrl: fileUrl, 
        theme, 
        room,
        userId: user?.id
      }),
    });

    try {
      let newPhoto = await res.json();
      
      if (res.status !== 200) {
        // Verificar se a resposta contém uma mensagem de erro estruturada
        if (newPhoto && newPhoto.error) {
          setError(newPhoto.error);
        } else {
          setError(typeof newPhoto === 'string' ? newPhoto : 'Erro ao gerar a imagem. Por favor, tente novamente.');
        }
        // Atualizar os créditos, pois podem ter sido devolvidos em caso de erro
        fetchUserCredits();
      } else {
        // A API já debita o crédito automaticamente, apenas atualizar a interface
        fetchUserCredits(); // Atualizar os créditos após geração bem-sucedida
        // Corrigindo o acesso ao resultado da API
        setRestoredImage(Array.isArray(newPhoto) ? newPhoto[1] : newPhoto);
      }
    } catch (error) {
      console.error('Erro ao processar resposta da API:', error);
      setError('Erro ao processar a resposta do servidor. Por favor, tente novamente.');
      // Atualizar os créditos, pois podem ter sido devolvidos em caso de erro
      fetchUserCredits();
    }
    setTimeout(() => {
      setLoading(false);
    }, 1300);
  }
  
  // Não precisamos mais da função debitCredit pois a API já faz isso

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8">
        {!user && !authLoading ? (
          <div className="text-center p-8 border border-gray-200 rounded-xl shadow-md bg-white max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Faça login para acessar esta página</h2>
            <p className="text-gray-600 mb-6">Você precisa estar logado para usar o recurso de redecoração de ambientes</p>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        ) : (
          <>
          <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-gray-800 sm:text-6xl mb-5 font-poppins">
            Crie o ambiente dos seus <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">sonhos</span>
          </h1>
          <div className="mb-6">
            <div className="credits-badge">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Você tem <span className="font-bold">{credits}</span> créditos disponíveis
                {credits <= 2 && (
                  <Link href="/creditos" className="ml-2 text-white underline hover:text-blue-100 transition-colors">
                    Comprar mais
                  </Link>
                )}
              </span>
            </div>
          </div>
        </>
        )}
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="flex justify-between items-center w-full flex-col mt-4">
              {!restoredImage && (
                <>
                  <div className="space-y-4 w-full max-w-sm">
                    <div className="flex mt-3 items-center space-x-3">
                      <Image
                        src="/number-1-blue.svg"
                        width={30}
                        height={30}
                        alt="1 icon"
                      />
                      <p className="text-left font-medium text-gray-700 font-poppins">
                        Escolha o estilo da redecoração.
                      </p>
                    </div>
                    <DropDown
                      theme={theme}
                      setTheme={(newTheme) =>
                        setTheme(newTheme as typeof theme)
                      }
                      themes={themes}
                    />
                  </div>
                  <div className="space-y-4 w-full max-w-sm">
                    <div className="flex mt-10 items-center space-x-3">
                      <Image
                        src="/number-2-blue.svg"
                        width={30}
                        height={30}
                        alt="2 icon"
                      />
                      <p className="text-left font-medium text-gray-700 font-poppins">
                        Escolha o ambiente.
                      </p>
                    </div>
                    <DropDown
                      theme={room}
                      setTheme={(newRoom) => setRoom(newRoom as typeof room)}
                      themes={rooms}
                    />
                  </div>
                  <div className="mt-4 w-full max-w-sm">
                    <div className="flex mt-6 w-96 items-center space-x-3">
                      <Image
                        src="/number-3-blue.svg"
                        width={30}
                        height={30}
                        alt="3 icon"
                      />
                      <p className="text-left font-medium text-gray-700 font-poppins">
                        Carregue uma foto do seu ambiente.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {restoredImage && (
                <div className="font-poppins text-lg text-gray-700 mb-4 bg-blue-50 px-5 py-3 rounded-lg shadow-sm">
                  Aqui está o seu <b className="text-blue-600">{room.toLowerCase()}</b> redecorado com o tema{" "}
                  <b className="text-blue-600">{theme.toLowerCase()}</b> {" "}
                </div>
              )}
              <div
                className={`${
                  restoredLoaded ? "visible mt-6 -ml-8" : "invisible"
                }`}
              >
                <Toggle
                  className={`${restoredLoaded ? "visible mb-6" : "invisible"}`}
                  sideBySide={sideBySide}
                  setSideBySide={(newVal) => setSideBySide(newVal)}
                />
              </div>
              {restoredLoaded && sideBySide && (
                <CompareSlider
                  original={originalPhoto!}
                  restored={restoredImage!}
                />
              )}
              {!originalPhoto && user && <UploadDropZone />}
              {originalPhoto && !restoredImage && (
                <Image
                  alt="original photo"
                  src={originalPhoto}
                  className="rounded-2xl h-96"
                  width={475}
                  height={475}
                />
              )}
              {restoredImage && originalPhoto && !sideBySide && (
                <div className="flex sm:space-x-4 sm:flex-row flex-col">
                  <div>
                    <h2 className="mb-1 font-medium text-lg font-poppins text-gray-700">Foto Original</h2>
                    <Image
                      alt="original room"
                      src={originalPhoto}
                      className="rounded-2xl relative w-full h-96"
                      width={475}
                      height={475}
                    />
                  </div>
                  <div className="sm:mt-0 mt-8">
                    <h2 className="mb-1 font-medium text-lg font-poppins text-gray-700">Foto Redecorada</h2>
                    <a href={restoredImage} target="_blank" rel="noreferrer">
                      <Image
                        alt="restored photo"
                        src={restoredImage}
                        className="rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in w-full h-96"
                        width={475}
                        height={475}
                        onLoadingComplete={() => setRestoredLoaded(true)}
                      />
                    </a>
                  </div>
                </div>
              )}
              {loading && (
                <button
                  disabled
                  className="bg-blue-500 rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 w-40"
                >
                  <span className="pt-4">
                    <LoadingDots color="white" style="large" />
                  </span>
                </button>
              )}
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8 shadow-sm font-poppins"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                  {error.includes("créditos") && (
                    <div className="mt-3">
                      <Link 
                        href="/creditos"
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors inline-block shadow-md hover:shadow-lg"
                      >
                        Adquirir Créditos
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <div className="flex space-x-2 justify-center">
                {originalPhoto && !loading && (
                  <button
                    onClick={() => {
                      setOriginalPhoto(null);
                      setRestoredImage(null);
                      setRestoredLoaded(false);
                      setError(null);
                    }}
                    className="bg-blue-500 rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-blue-500/80 transition shadow-md hover:shadow-lg font-poppins"
                  >
                    Criar novo ambiente
                  </button>
                )}
                {restoredLoaded && (
                  <button
                    onClick={() => {
                      downloadPhoto(
                        restoredImage!,
                        appendNewToName(photoName!)
                      );
                    }}
                    className="bg-white rounded-full text-black border font-medium px-4 py-2 mt-8 hover:bg-gray-100 transition shadow-sm hover:shadow-md font-poppins"
                  >
                    Baixar foto redecorada
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
    </div>
  );
}
