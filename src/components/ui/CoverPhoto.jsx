import { useRef } from 'react';
import { IoCamera } from 'react-icons/io5';

const CoverPhoto = ({ src, alt = 'Cover', editable = false, onImageSelect }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
    e.target.value = '';
  };

  return (
    <div className="relative w-full h-48 md:h-64 bg-bg-secondary overflow-hidden">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
          <span className="text-text-muted text-4xl">📸</span>
        </div>
      )}

      {editable && (
        <>
          <button
            type="button"
            onClick={handleClick}
            className="absolute bottom-3 right-3 z-20 p-2.5 rounded-full bg-bg-primary bg-opacity-80 text-text-primary hover:bg-opacity-100 shadow-lg cursor-pointer"
          >
            <IoCamera size={18} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};

export default CoverPhoto;