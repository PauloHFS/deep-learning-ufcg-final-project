import { useState, useRef, useEffect, useCallback, memo, FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, AlertTriangle } from "lucide-react";

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const CameraComponent: FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  // FIX: Lógica de inicialização e limpeza movida para uma função `useCallback`
  // para garantir consistência e evitar recriação a cada render.
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const startStream = async () => {
      // Limpa qualquer stream anterior antes de iniciar um novo.
      stopStream();

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Seu navegador não suporta o acesso à câmera.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
        });

        if (isActive) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // O play() retorna uma promise que pode ser rejeitada se interrompida.
            // Ignorar a rejeição é seguro aqui, pois o cleanup cuidará do estado.
            videoRef.current.play().catch((err) => {
              if (err.name !== "AbortError") {
                console.error("Video play failed:", err);
              }
            });
            setError(null);
          }
        } else {
          // Se o componente foi desmontado enquanto o stream era solicitado, pare-o.
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err: any) {
        if (isActive) {
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
            message =
              "Nenhuma câmera compatível foi encontrada no dispositivo.";
          }
          setError(message);
        }
      }
    };

    startStream();

    // A função de limpeza agora só precisa chamar a função `stopStream`.
    return () => {
      isActive = false;
      stopStream();
    };
  }, [facingMode, stopStream]);

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

      // FIX: Adicionado um check para garantir que `onCapture` é uma função antes de chamá-la.
      // Isso previne o crash e informa sobre o erro de implementação no componente pai.
      if (typeof onCapture === "function") {
        onCapture(canvas.toDataURL("image/jpeg"));
      } else {
        console.error(
          "CameraComponent Error: A prop onCapture não é uma função. Verifique a implementação do componente pai."
        );
        setError("Ocorreu um erro ao processar a imagem.");
      }
    }
  }, [facingMode, onCapture]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  // FIX: Função de fechamento que garante a parada do stream antes de notificar o pai.
  const handleClose = useCallback(() => {
    stopStream();
    onClose();
  }, [stopStream, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            className="absolute inset-0 z-20 bg-white"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>

      {error ? (
        <div className="z-10 flex flex-col items-center justify-center h-full text-white text-center p-6">
          <AlertTriangle size={48} className="mb-4 text-amber-400" />
          <p className="text-lg">{error}</p>
          <button
            onClick={handleClose}
            className="mt-6 px-5 py-2 bg-neutral-700 text-white rounded-lg font-semibold"
          >
            Voltar
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 pointer-events-none">
            <div className="flex justify-end w-full pointer-events-auto">
              <button
                onClick={handleClose}
                className="bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-colors"
                aria-label="Fechar câmera"
              >
                <X size={28} />
              </button>
            </div>
            <div className="grid grid-cols-3 items-center w-full pointer-events-auto">
              <div className="flex justify-start">
                {/* Espaço reservado ou futuro botão de galeria */}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full bg-white/30 p-1 ring-4 ring-white/50 flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Capturar foto"
                >
                  <div className="w-full h-full rounded-full bg-white" />
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={switchCamera}
                  className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 active:scale-95 transition-all"
                  aria-label="Alternar câmera"
                >
                  <RefreshCw size={28} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default memo(CameraComponent);
