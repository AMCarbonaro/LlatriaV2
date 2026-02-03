import React, { useRef, useState, useEffect } from 'react';
import { RotateCw, Crop, ZoomIn, ZoomOut, X, Check } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { clsx } from 'clsx';

interface ImageEditorProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImage: string) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  isOpen,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen && image) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawImage();
      };
      img.src = image;
    }
  }, [image, isOpen, rotation, brightness, contrast, zoom]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    const img = imageRef.current;
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    ctx.drawImage(
      img,
      -img.width * scale * 0.5,
      -img.height * scale * 0.5,
      img.width * scale,
      img.height * scale
    );

    ctx.restore();

    // Draw crop rectangle if cropping
    if (isCropping && cropStart && cropEnd) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      const x = Math.min(cropStart.x, cropEnd.x);
      const y = Math.min(cropStart.y, cropEnd.y);
      const width = Math.abs(cropEnd.x - cropStart.x);
      const height = Math.abs(cropEnd.y - cropStart.y);
      ctx.strokeRect(x, y, width, height);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setZoom(1);
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const editedImage = canvas.toDataURL('image/jpeg', 0.9);
    onSave(editedImage);
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCropStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCropEnd({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    drawImage();
  };

  const handleMouseUp = () => {
    if (isCropping && cropStart && cropEnd) {
      // Apply crop (simplified - would need more complex logic for actual cropping)
      drawImage();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Image" size="lg">
      <div className="space-y-4">
        <div className="flex items-center justify-center bg-muted rounded-lg p-4">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-96 border border-border rounded"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>

        <div className="space-y-4">
          {/* Rotation */}
          <div>
            <label className="block text-sm font-medium mb-2">Rotation</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4 mr-1" />
                Rotate 90°
              </Button>
              <span className="text-sm text-muted-foreground">{rotation}°</span>
            </div>
          </div>

          {/* Brightness */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Brightness: {brightness}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Contrast */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contrast: {contrast}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Zoom */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Crop Toggle */}
          <div>
            <Button
              variant={isCropping ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsCropping(!isCropping)}
            >
              <Crop className="h-4 w-4 mr-1" />
              {isCropping ? 'Stop Cropping' : 'Crop'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};






