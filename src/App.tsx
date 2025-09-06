import { useState } from 'react';
import Classifier from './components/Classifier';
import Camera from './components/Camera';
import Uploader from './components/Uploader';

function App() {
  const [image, setImage] = useState<HTMLImageElement | HTMLVideoElement | null>(null);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Image Classification</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <Camera onCapture={setImage} />
        <Uploader onImageUpload={setImage} />
      </div>
      <Classifier image={image} />
    </div>
  )
}

export default App
