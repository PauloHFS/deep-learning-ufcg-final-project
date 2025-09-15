import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera as CameraIcon,
  Upload,
  Loader,
  AlertCircle,
} from "lucide-react";
// Importa o tipo base para estendê-lo
import type { MobileNet as MobileNetBase } from "@tensorflow-models/mobilenet";

import Camera from "./components/Camera";
import Classifier from "./components/Classifier";

// Adiciona o método dispose ao tipo do modelo, que está ausente no pacote oficial
type MobileNet = MobileNetBase & {
  dispose: () => void;
};

type AppStatus = "loading" | "ready" | "error" | "capturing" | "displaying";

function App() {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [model, setModel] = useState<MobileNet | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let modelInstance: MobileNet | null = null;

    const loadModel = async () => {
      try {
        const [mobilenet] = await Promise.all([
          import("@tensorflow-models/mobilenet"),
          import("@tensorflow/tfjs-backend-cpu"),
          import("@tensorflow/tfjs-backend-webgl"),
        ]);

        console.log("Loading MobileNet model...");
        modelInstance = (await mobilenet.load()) as MobileNet;
        console.log("Model loaded.");

        setModel(modelInstance);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load TensorFlow model:", error);
        setStatus("error");
      }
    };

    loadModel();

    return () => {
      if (modelInstance) {
        modelInstance.dispose();
        console.log("Model disposed.");
      }
    };
  }, []);

  const handleCapture = (capturedImageSrc: string) => {
    setImageSrc(capturedImageSrc);
    setStatus("displaying");
  };

  const handleCloseCamera = () => {
    setStatus("ready");
  };

  const handleRetry = () => {
    setImageSrc(null);
    setStatus("ready");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Lógica de verificação de tipo mais segura
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setImageSrc(e.target.result);
          setStatus("displaying");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <main className="bg-background min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col items-center gap-4"
          >
            <Loader className="w-12 h-12 animate-spin text-primary" />
            <p className="text-on-surface-secondary text-lg">
              Inicializando IA...
            </p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col items-center gap-4 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h2 className="text-2xl font-bold text-on-surface">
              Erro ao Carregar
            </h2>
            <p className="text-on-surface-secondary">
              Não foi possível inicializar o modelo.
              <br />
              Por favor, recarregue a página.
            </p>
          </motion.div>
        )}

        {status === "ready" && (
          <motion.div
            key="ready"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col items-center gap-8 text-center"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-on-surface"
              initial={{ y: -20, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { delay: 0.2, duration: 0.5 },
              }}
            >
              Classificador de Imagens
            </motion.h1>
            <motion.p
              className="text-lg text-on-surface-secondary max-w-md"
              initial={{ y: -20, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { delay: 0.4, duration: 0.5 },
              }}
            >
              Use a câmera do seu dispositivo ou envie um arquivo para
              identificar objetos em tempo real.
            </motion.p>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <motion.button
                className="bg-primary text-on-primary font-semibold text-lg px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-primary/90 active:scale-95 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                onClick={() => setStatus("capturing")}
              >
                <CameraIcon className="w-6 h-6" />
                Escanear com a Câmera
              </motion.button>
              <motion.button
                className="bg-surface text-on-surface font-semibold text-lg px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-surface/80 active:scale-95 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                onClick={handleUploadClick}
              >
                <Upload className="w-6 h-6" />
                Enviar uma Imagem
              </motion.button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </motion.div>
        )}

        {status === "capturing" && (
          <Camera onCapture={handleCapture} onClose={handleCloseCamera} />
        )}

        {status === "displaying" && imageSrc && model && (
          <Classifier imageSrc={imageSrc} model={model} onRetry={handleRetry} />
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
