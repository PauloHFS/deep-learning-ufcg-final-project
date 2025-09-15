import { useState, useRef, useEffect, useCallback, memo, FC } from "react";

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const CameraComponent: FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

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
    if (capturedImage) {
      stopStream();
      return;
    }

    let isActive = true;
    const startStream = async () => {
      stopStream();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
        });
        if (isActive && videoRef.current) {
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        setError("Could not access the camera. Please check permissions.");
      }
    };

    startStream();

    return () => {
      isActive = false;
      stopStream();
    };
  }, [facingMode, stopStream, capturedImage]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current) return;
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
      setCapturedImage(canvas.toDataURL("image/jpeg"));
    }
  }, [facingMode]);

  const handleConfirm = () => {
    stopStream(); // Explicitly stop stream
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleClose = useCallback(() => {
    stopStream();
    onClose();
  }, [onClose, stopStream]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {error && <p className="text-white text-center p-4 bg-red-800">{error}</p>}
      
      <div className="flex-grow flex items-center justify-center overflow-hidden">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured preview" className="max-w-full max-h-full object-contain" />
        ) : (
          <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline muted />
        )}
      </div>

      <div className="flex-shrink-0 flex justify-center items-center gap-6 p-6 bg-black">
        {capturedImage ? (
          <>
            <button 
              onClick={handleRetake} 
              className="px-6 py-3 bg-gray-700 text-white text-lg rounded-lg transition-transform active:scale-95"
            >
              Retake
            </button>
            <button 
              onClick={handleConfirm} 
              className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg transition-transform active:scale-95"
            >
              Use Photo
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleClose} 
              className="px-5 py-3 bg-red-600 text-white text-lg rounded-lg transition-transform active:scale-95"
            >
              Close
            </button>
            <button 
              onClick={handleCapture} 
              className="p-4 bg-blue-600 text-white text-xl rounded-full transition-transform active:scale-95 aspect-square"
            >
              Capture
            </button>
            <button 
              onClick={switchCamera} 
              className="px-5 py-3 bg-gray-700 text-white text-lg rounded-lg transition-transform active:scale-95"
            >
              Switch
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(CameraComponent);
