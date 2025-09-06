import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader, RefreshCcw } from 'lucide-react';

// Type definitions
interface Prediction {
  className: string;
  probability: number;
}

interface ClassifierProps {
  imageSrc: string;
  model: any; // MobileNet model
  onRetry: () => void;
}

const Classifier = ({ imageSrc, model, onRetry }: ClassifierProps) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [status, setStatus] = useState('classifying'); // Start in classifying state
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = async () => {
    if (model && imageRef.current) {
      console.log('Image loaded, starting classification...');
      setStatus('classifying');
      try {
        const results = await model.classify(imageRef.current);
        console.log('Classification results:', results);
        setPredictions(results);
        setStatus('done');
      } catch (error) {
        console.error("Error during classification:", error);
        setStatus('done'); // Move to done state even if error to not get stuck
      }
    }
  };

  const topPrediction = predictions[0];

  return (
    <motion.div
      key="displaying"
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-on-surface">Resultado da Análise</h2>
      
      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-surface">
        <img 
          src={imageSrc} 
          alt="captured" 
          ref={imageRef} 
          className="w-full h-auto transition-opacity duration-300"
          onLoad={handleImageLoad} // Trigger classification when image is loaded
          style={{ opacity: status === 'classifying' ? 0.5 : 1 }} // Dim image while classifying
        />
        {status === 'classifying' && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
            <Loader className="w-10 h-10 animate-spin text-white" />
            <p className="text-white text-lg font-semibold">Analisando...</p>
          </div>
        )}
      </div>

      {status === 'done' && topPrediction && (
        <motion.div 
          className="w-full bg-surface p-6 rounded-xl shadow-lg flex flex-col gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-on-surface-secondary text-sm uppercase tracking-wider">Principal resultado:</p>
          <h3 className="text-3xl font-bold text-primary capitalize">{topPrediction.className.split(', ')[0]}</h3>
          <div className="w-full bg-background rounded-full h-4 overflow-hidden">
            <motion.div 
              className="bg-primary h-full"
              initial={{ width: 0 }}
              animate={{ width: `${topPrediction.probability * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-right text-on-surface font-semibold">Confiança: {(topPrediction.probability * 100).toFixed(1)}%</p>
        </motion.div>
      )}

      {status === 'done' && !topPrediction && (
         <div className="w-full bg-surface p-6 rounded-xl shadow-lg flex flex-col gap-4 text-center">
            <p className="text-on-surface-secondary">Não foi possível classificar a imagem.</p>
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