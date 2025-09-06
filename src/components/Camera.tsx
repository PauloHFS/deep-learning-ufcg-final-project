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
            facingMode: { exact: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError(null);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
      }
    };

    enableStream();

    // Cleanup function to stop all tracks of the stream
    return () => {
      if (stream) {
        console.log('Stopping camera stream.');
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
        // Flip the image horizontally if it's the front camera
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
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {error ? (
        <div className="text-white text-center p-4">
          <p>{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary rounded-lg">Voltar</button>
        </div>
      ) : (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      )}

      {isFlashing && <motion.div 
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0 }}
        onAnimationComplete={() => setIsFlashing(false)}
        transition={{ duration: 0.2 }}
      />}

      {/* --- CONTROLS OVERLAY --- */}
      {!error && (
        <>
          {/* TOP CONTROLS */}
          <div className="absolute top-0 left-0 right-0 p-5 flex justify-between">
            <button onClick={switchCamera} className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors">
              <RefreshCw size={24} />
            </button>
            <button onClick={onClose} className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* BOTTOM CONTROLS (SHUTTER) */}
          <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-center">
            <button 
              onClick={handleCapture} 
              className="w-20 h-20 rounded-full bg-transparent border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Capture photo"
            >
              <div className="w-[60px] h-[60px] rounded-full bg-white/90"></div>
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Camera;