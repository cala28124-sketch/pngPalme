// src/components/DraggableImage.tsx

import React from 'react';
import '../renderer/App.css';

interface DraggableImageProps {
  src: string;
  alt: string;
  width: number;
  onClick: () => void;
}

function DraggableImage({ src, alt, width, onClick }: DraggableImageProps) {
  return (
    // This div is the handle that moves the entire window
    <div className="drag-region">
      <button
        type="button"
        className="image-button draggable-png"
        onClick={onClick}
      >
        <img src={src} alt={alt} width={width} />
      </button>
    </div>
  );
}

export default DraggableImage;
