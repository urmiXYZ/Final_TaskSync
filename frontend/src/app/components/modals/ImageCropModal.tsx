"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage"; 
import type { Area } from "react-easy-crop"; 

interface ImageCropModalProps {
  file: File;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropModal({
  file,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteInternal = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    const imageDataUrl = URL.createObjectURL(file);
    if (!croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageDataUrl, croppedAreaPixels);
      onCropComplete(croppedBlob);
      onClose();
    } catch (error) {
      console.error("Cropping failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90vw] max-w-lg relative">
        <div className="relative w-full h-96 bg-gray-200">
          <Cropper
            image={URL.createObjectURL(file)}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteInternal}
          />
        </div>

        <div className="mt-4 space-y-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="range range-primary w-full"
          />

          <div className="flex justify-end gap-3">
            <button className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCrop}>
              Crop & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
