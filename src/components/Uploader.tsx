import { useState } from 'react';

const Uploader = ({ onImageUpload }: { onImageUpload: (image: HTMLImageElement) => void }) => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => onImageUpload(img);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-4">
      <input type="file" accept="image/jpeg, image/png" onChange={handleImageUpload} />
      {image && <img src={image} alt="Uploaded image" className="mt-4 w-full h-auto" />}
    </div>
  );
};

export default Uploader;
