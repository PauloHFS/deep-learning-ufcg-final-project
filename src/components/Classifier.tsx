import { useEffect, useState } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';

const Classifier = ({ image }: { image: HTMLImageElement | HTMLVideoElement | null }) => {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<{ className: string; probability: number }[] | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await mobilenet.load();
        setModel(model);
        setLoading(false);
      } catch (error) {
        console.error('Error loading model', error);
      }
    };
    loadModel();
  }, []);

  const classifyImage = async () => {
    if (model && image) {
      try {
        const predictions = await model.classify(image);
        setPrediction(predictions);
      } catch (error) {
        console.error('Error classifying image', error);
      }
    }
  };

  return (
    <div className="mt-4">
      {loading && <p>Loading model...</p>}
      {model && image && (
        <button onClick={classifyImage} className="bg-green-500 text-white px-4 py-2 rounded">
          Classify Image
        </button>
      )}
      {prediction && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Prediction:</h2>
          <p>{prediction[0].className} ({Math.round(prediction[0].probability * 100)}%)</p>
        </div>
      )}
    </div>
  );
};

export default Classifier;
