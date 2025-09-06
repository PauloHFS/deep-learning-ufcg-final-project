import { useRef, useState, useEffect } from 'react';

const Camera = ({ onCapture }: { onCapture: (image: HTMLVideoElement) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState('user');

  useEffect(() => {
    const getCameraFeed = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera', error);
      }
    };
    getCameraFeed();
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const captureImage = () => {
    if (videoRef.current) {
      onCapture(videoRef.current);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
      <div className="flex justify-between mt-4">
        <button onClick={switchCamera} className="bg-blue-500 text-white px-4 py-2 rounded">
          Switch Camera
        </button>
        <button onClick={captureImage} className="bg-green-500 text-white px-4 py-2 rounded">
          Capture
        </button>
      </div>
    </div>
  );
};

export default Camera;
