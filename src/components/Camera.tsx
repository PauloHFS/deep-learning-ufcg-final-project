import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, AlertTriangle } from "lucide-react";

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const CameraComponent = ({ onCapture, onClose }: CameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  useEffect(() => {
    // ... (lógica de acesso à câmera permanece a mesma)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Seu navegador não suporta o acesso à câmera.");
      return;
    }
    let stream: MediaStream | null = null;
    const enableStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError(null);
      } catch (err: any) {
        console.error("Camera Error:", err);
        let message = "Não foi possível acessar a câmera.";
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          message =
            "Permissão de câmera negada. Verifique as configurações do navegador.";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          message = "Nenhuma câmera compatível foi encontrada no dispositivo.";
        }
        setError(message);
      }
    };
    enableStream();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current) return;
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 120);
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    if (context) {
      if (facingMode === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      onCapture(canvas.toDataURL("image/jpeg"));
    }
  }, [facingMode, onCapture]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  return (
    <motion.div
      // 1. Alterado para 'fixed' para ocupar a tela inteira, independente do pai.
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            className="absolute inset-0 z-20 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
          />
        )}
      </AnimatePresence>

      {error ? (
        <div className="z-10 flex flex-col items-center justify-center h-full text-white text-center p-6">
          <AlertTriangle size={48} className="mb-4 text-amber-400" />
          <p className="text-lg">{error}</p>
          <button
            onClick={onClose}
            className="mt-6 px-5 py-2 bg-surface text-on-surface rounded-lg font-semibold"
          >
            Voltar
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      )}

      {!error && (
        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
          {/* Controles Superiores */}
          <div className="flex justify-end w-full">
            <button
              onClick={onClose}
              className="bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-colors"
              aria-label="Fechar câmera"
            >
              <X size={28} />
            </button>
          </div>

          {/* 2. Controles Inferiores refeitos com Grid para robustez */}
          <div className="grid grid-cols-3 items-center w-full">
            {/* Espaço Vazio à Esquerda */}
            <div />

            {/* Botão de Captura Centralizado */}
            <div className="flex justify-center">
              <button
                onClick={handleCapture}
                className="w-20 h-20 rounded-full bg-white/30 ring-4 ring-white flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Capturar foto"
              >
                <div className="w-[70px] h-[70px] rounded-full bg-white" />
              </button>
            </div>

            {/* Botão de Trocar Câmera à Direita */}
            <div className="flex justify-center">
              <button
                onClick={switchCamera}
                className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 active:scale-95 transition-all"
                aria-label="Alternar câmera"
              >
                <RefreshCw size={32} />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default memo(CameraComponent);
