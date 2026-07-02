import React from 'react';
import { DraggableImage } from '@/src/components/DraggableImage';
import { ImageData, Point } from '@/src/types';

interface ImageManagerProps {
  images: ImageData[];
  onUpdate: (id: string, updates: Partial<ImageData>) => void;
  onRemove: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isCleanMode: boolean;
}

export const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  onUpdate,
  onRemove,
  containerRef,
  isCleanMode
}) => {
  return (
    <>
      {images.map((image) => (
        <DraggableImage
          key={image.id}
          image={image}
          onUpdate={onUpdate}
          onRemove={onRemove}
          containerRef={containerRef}
          isCleanMode={isCleanMode}
        />
      ))}
    </>
  );
};
