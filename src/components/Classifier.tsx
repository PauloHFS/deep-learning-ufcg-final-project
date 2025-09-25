import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader, RefreshCcw } from "lucide-react";
import * as tf from "@tensorflow/tfjs";

// Type definitions
interface Prediction {
  className: string;
  probability: number;
}

interface ClassifierProps {
  imageSrc: string;
  model: tf.GraphModel;
  onRetry: () => void;
}

const RACE_CLASSES = [
  "East Asian",
  "Indian",
  "Black",
  "White",
  "Middle Eastern",
  "Latino_Hispanic",
  "Southeast Asian",
];

const Classifier = ({ imageSrc, model, onRetry }: ClassifierProps) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [status, setStatus] = useState("loading"); // 'loading', 'classifying', 'done'
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (status === "loading" && imageRef.current && imageRef.current.complete) {
      handleImageLoad();
    }
  }, [status]);

  const handleImageLoad = async () => {
    // 1. Use "guard clauses" no início para validação e clareza.
    if (!model || !imageRef.current) {
      console.warn("Modelo ou referência da imagem não estão prontos.");
      return;
    }

    console.log("Imagem carregada, iniciando classificação...");
    setStatus("classifying");

    // Declara os tensores fora do bloco try para que possam ser acessados no `finally`.
    let inputTensor: tf.Tensor | undefined;
    let predictionTensor: tf.Tensor | undefined;

    try {
      // Pré-processamento (seu código com tf.tidy já está ótimo aqui).
      inputTensor = tf.tidy(() => {
        const img = tf.browser.fromPixels(imageRef.current!);
        const resized = tf.image.resizeBilinear(img, [224, 224]);
        const floatTensor = resized.toFloat();
        return floatTensor.expandDims();
      });

      // Fazer a predição.
      predictionTensor = model.predict(inputTensor) as tf.Tensor;
      const probabilities = (await predictionTensor.data()) as Float32Array;

      // 2. Processamento dos resultados (lógica mantida, pois já é eficiente).
      const results = Array.from(probabilities)
        .map((probability, i) => ({
          className: RACE_CLASSES[i],
          probability,
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 3); // Top 3

      console.log("Resultados da classificação:", results);
      setPredictions(results);
    } catch (error) {
      console.error("Erro durante a classificação:", error);
      setPredictions([]); // Limpa predições anteriores em caso de erro.
    } finally {
      // 3. Bloco `finally` para garantir a limpeza da memória e atualização do estado.
      // Este código será executado sempre, com ou sem erros no bloco `try`.
      if (inputTensor) inputTensor.dispose();
      if (predictionTensor) predictionTensor.dispose();

      setStatus("done");
      console.log("Limpeza de memória concluída, classificação finalizada.");
    }
  };

  return (
    <motion.div
      key="displaying"
      className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-on-surface text-center">
        Resultado da Análise
      </h2>

      <div className="relative w-full max-h-[60vh] bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
        <img
          src={imageSrc}
          alt="captured"
          ref={imageRef}
          className="w-auto h-auto max-w-full max-h-full object-contain transition-opacity duration-300"
          onLoad={handleImageLoad}
          style={{ opacity: status === "classifying" ? 0.5 : 1 }}
        />
        {status !== "done" && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
            <Loader className="w-10 h-10 animate-spin text-white" />
            <p className="text-white text-lg font-semibold">Analisando...</p>
          </div>
        )}
      </div>

      {status === "done" && predictions.length > 0 && (
        <motion.div
          className="w-full bg-surface p-6 rounded-xl shadow-lg flex flex-col gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="text-on-surface-secondary text-sm uppercase tracking-wider mb-2">
            Top 3 Resultados:
          </h3>
          <div className="flex flex-col gap-5">
            {predictions.map((prediction, index) => (
              <div key={prediction.className}>
                <div className="flex justify-between items-center mb-1">
                  <p
                    className={`font-bold capitalize ${
                      index === 0
                        ? "text-primary text-xl"
                        : "text-on-surface text-lg"
                    }`}
                  >
                    {index + 1}. {prediction.className.split(", ")[0]}
                  </p>
                  <p
                    className={`font-semibold ${
                      index === 0
                        ? "text-primary text-lg"
                        : "text-on-surface-secondary"
                    }`}
                  >
                    {(prediction.probability * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="w-full bg-background rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`${
                      index === 0 ? "bg-primary" : "bg-gray-400"
                    } h-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${prediction.probability * 100}%` }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {status === "done" && predictions.length === 0 && (
        <div className="w-full bg-surface p-6 rounded-xl shadow-lg flex flex-col gap-4 text-center">
          <p className="text-on-surface-secondary">
            Não foi possível classificar a imagem.
          </p>
        </div>
      )}

      <motion.button
        onClick={onRetry}
        className="bg-primary text-on-primary font-semibold text-lg px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-primary/90 active:scale-95 transition-all duration-200 mt-4"
        whileHover={{ scale: 1.05 }}
      >
        <RefreshCcw className="w-6 h-6" />
        Escanear Novamente
      </motion.button>
    </motion.div>
  );
};

export default Classifier;
