import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const Camera = ({ onCapture, onClose }: CameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  useEffect(() => {
    let stream: MediaStream | null = null;

    const enableStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setError(null);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
      }
    };

    enableStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (videoRef.current) {
      setIsFlashing(true);
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }
      const imageSrc = canvas.toDataURL('image/jpeg');
      onCapture(imageSrc);
    }
  };

  const switchCamera = () => {
    setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="relative w-full h-full bg-black">
      {error ? (
        <div className="z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
          <p>{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 rounded-lg">Voltar</button>
        </div>
      ) : (
        <video ref={videoRef} className="w-full h-full object-cover" />
      )}

      {isFlashing && <div className="absolute inset-0 bg-white opacity-70" />}

      {!error && (
        <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
          {/* Controles Superiores */}
          <div className="flex justify-end">
            <button onClick={onClose} className="bg-black/50 rounded-full p-2 text-white">
              <X size={24} />
            </button>
          </div>

          {/* Controles Inferiores */}
          <div className="flex justify-between items-center px-4 w-full">
            {/* Left-aligned placeholder (empty for now, or could be another button if needed) */}
            <div className="w-16 h-16"></div> {/* Match switch camera button size for balance */}

            {/* Botão do Obturador (centered) */}
            <div className="flex-grow flex justify-center"> {/* Use flex-grow to take available space and center */}
              <button onClick={handleCapture} className="w-24 h-24 rounded-full bg-white/30 ring-4 ring-white flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white" />
              </button>
            </div>

            {/* Botão de Trocar Câmera (right-aligned) */}
            <button onClick={switchCamera} className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white">
              <RefreshCw size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;
