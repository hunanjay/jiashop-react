import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "./modal";
import { Button } from "./button";

export function ImageCropper({ 
  image, 
  open, 
  onClose, 
  onCropComplete,
  aspectRatio = 1,
  outputWidth,
  outputHeight,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, {
        outputWidth,
        outputHeight,
      });
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error("裁剪失败:", error);
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-3xl bg-white text-slate-900 border-black/5 shadow-[0_40px_120px_rgba(0,0,0,0.15)]">
        <ModalHeader className="border-b border-black/5 bg-slate-50/50">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">裁剪图片</h2>
        </ModalHeader>
        <ModalBody className="p-0">
          <div className="relative h-[400px] bg-gray-900">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteHandler}
            />
          </div>
          <div className="space-y-4 p-6 bg-white">
            <div className="flex items-center justify-between">
               <label className="text-xs font-bold uppercase tracking-wider text-slate-400">缩放控制</label>
               <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </ModalBody>
        <ModalFooter className="border-t border-black/5 bg-slate-50/50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} className="bg-white border-black/5 text-slate-600 hover:bg-slate-50">
            取消
          </Button>
          <Button onClick={createCroppedImage} className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20">
            确认裁剪
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// 辅助函数：生成裁剪后的图片
async function getCroppedImg(imageSrc, pixelCrop, options = {}) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("无法获取 canvas context");
  }

  const outputWidth = options.outputWidth || Math.round(pixelCrop.width);
  const outputHeight = options.outputHeight || Math.round(pixelCrop.height);
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const fileUrl = URL.createObjectURL(blob);
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    }, "image/jpeg", 0.92);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
