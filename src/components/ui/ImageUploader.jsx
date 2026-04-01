import { useState, useRef, useEffect } from "react";
import { ImageCropper } from "./ImageCropper";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Upload, X, Edit } from "lucide-react";
import { useApp } from "../../lib/app-context";
import { cn } from "../../lib/utils";

export function ImageUploader({ 
  mainImageUrl,
  subImageUrls = [],
  onMainImageChange,
  onSubImagesChange,
  maxSubImages = 5,
  mainAspectRatio = 1,
  subAspectRatio = 3 / 4,
  mainOutputWidth = 800,
  mainOutputHeight = 800,
  subOutputWidth = 800,
  subOutputHeight = 1067,
}) {
  const { pushToast } = useApp();
  const [mainImage, setMainImage] = useState(null);
  const [subImages, setSubImages] = useState([]);
  const [cropImage, setCropImage] = useState(null);
  const [currentCropType, setCurrentCropType] = useState(null);
  const [currentEditIndex, setCurrentEditIndex] = useState(-1);
  
  const mainInputRef = useRef(null);
  const subInputRef = useRef(null);

  // Sync initial values
  useEffect(() => {
    if (mainImageUrl && (!mainImage || mainImage.url !== mainImageUrl)) {
      setMainImage({
        id: 'initial-main',
        url: mainImageUrl,
        originalUrl: mainImageUrl
      });
    } else if (!mainImageUrl) {
      setMainImage(null);
    }
  }, [mainImageUrl]);

  useEffect(() => {
    if (subImageUrls && subImageUrls.length > 0) {
      const mappedSubImages = subImageUrls.map((url, index) => ({
        id: `initial-sub-${index}`,
        url: url,
        originalUrl: url
      }));
      setSubImages(mappedSubImages);
    } else {
      setSubImages([]);
    }
  }, [subImageUrls]);

  const handleFileSelect = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      pushToast("error", "请选择图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result);
      setCurrentCropType(type);
      setCurrentEditIndex(-1);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl) => {
    if (currentCropType === "main") {
      const newImage = {
        id: Date.now().toString(),
        url: croppedImageUrl,
        originalUrl: cropImage,
      };
      setMainImage(newImage);
      onMainImageChange?.(croppedImageUrl);
      pushToast("success", "主图上传成功");
    } else if (currentCropType === "sub") {
      if (currentEditIndex >= 0) {
        // 编辑现有图片
        const updatedImages = [...subImages];
        updatedImages[currentEditIndex] = {
          ...updatedImages[currentEditIndex],
          url: croppedImageUrl,
        };
        setSubImages(updatedImages);
        onSubImagesChange?.(updatedImages.map(img => img.url));
        pushToast("success", "附图更新成功");
      } else {
        // 添加新图片
        if (subImages.length >= maxSubImages) {
          pushToast("error", `最多只能上传 ${maxSubImages} 张附图`);
          return;
        }
        const newImage = {
          id: Date.now().toString(),
          url: croppedImageUrl,
          originalUrl: cropImage,
        };
        const updatedImages = [...subImages, newImage];
        setSubImages(updatedImages);
        onSubImagesChange?.(updatedImages.map(img => img.url));
        pushToast("success", "附图上传成功");
      }
    }

    setCropImage(null);
    setCurrentCropType(null);
    setCurrentEditIndex(-1);
  };

  const handleRemoveMainImage = (e) => {
    e.stopPropagation();
    setMainImage(null);
    onMainImageChange?.(null);
    if (mainInputRef.current) {
      mainInputRef.current.value = "";
    }
  };

  const handleRemoveSubImage = (e, index) => {
    e.stopPropagation();
    const updatedImages = subImages.filter((_, i) => i !== index);
    setSubImages(updatedImages);
    onSubImagesChange?.(updatedImages.map(img => img.url));
  };

  const handleEditSubImage = (e, index) => {
    e.stopPropagation();
    setCropImage(subImages[index].originalUrl);
    setCurrentCropType("sub");
    setCurrentEditIndex(index);
  };

  const handleEditMainImage = (e) => {
    e.stopPropagation();
    if (mainImage) {
      setCropImage(mainImage.originalUrl);
      setCurrentCropType("main");
    }
  };

  return (
    <div className="space-y-10">
      {/* 主图上传 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-l-4 border-blue-600 pl-3">主展示封面 (800×800)</h3>
        </div>
        {mainImage ? (
          <Card className="relative w-full max-w-sm overflow-hidden group border-none shadow-none bg-slate-100/50 rounded-3xl ring-1 ring-black/5">
            <CardContent className="p-3">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm" style={{ aspectRatio: mainAspectRatio }}>
                <img
                  src={mainImage.url}
                  alt="主图"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-950/40 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                  <button
                    onClick={handleEditMainImage}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-2xl transition-all hover:scale-110 active:scale-90"
                    title="编辑裁剪"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleRemoveMainImage}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white shadow-2xl transition-all hover:scale-110 active:scale-90"
                    title="移除图片"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            onClick={() => mainInputRef.current?.click()}
            className="w-full max-w-sm border-2 border-dashed border-slate-200 bg-white/40 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-all duration-500 group"
            style={{ aspectRatio: mainAspectRatio }}
          >
            <div className="h-16 w-16 rounded-3xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center mb-5 group-hover:shadow-md group-hover:rotate-6 transition-all duration-500">
               <Upload className="h-7 w-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-sm font-bold text-slate-600">上传商品主图</p>
            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-medium">Auto-Crop to 3:4 Aspect</p>
          </div>
        )}
        <input
          ref={mainInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "main")}
        />
      </div>

      {/* 附图上传 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-l-4 border-blue-600 pl-3">附属画廊库 (3:4) ({subImages.length}/{maxSubImages})</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tabular-nums">Gallery Slots</span>
        </div>
        
        <div className="space-y-4">
          {subImages.map((image, index) => (
            <Card key={image.id} className="relative w-full max-w-sm overflow-hidden group border-none shadow-none bg-slate-100/30 rounded-3xl ring-1 ring-black/5">
              <CardContent className="p-3">
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm" style={{ aspectRatio: subAspectRatio }}>
                  <img
                    src={image.url}
                    alt={`附图 ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-950/40 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                    <button
                      onClick={(e) => handleEditSubImage(e, index)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl transition-all hover:scale-110 active:scale-90"
                    >
                      <Edit className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={(e) => handleRemoveSubImage(e, index)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-white shadow-xl transition-all hover:scale-110 active:scale-90"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[9px] font-bold text-slate-900 shadow-sm uppercase tracking-tighter ring-1 ring-black/5">
                    Gallery #{index + 1}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {subImages.length < maxSubImages && (
            <div
              onClick={() => subInputRef.current?.click()}
              className="w-full max-w-sm border-2 border-dashed border-slate-200 bg-white/40 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-all duration-500 group"
              style={{ aspectRatio: subAspectRatio }}
            >
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center mb-4 group-hover:shadow-md group-hover:rotate-[-6deg] transition-all duration-500">
                <Upload className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">新增附图 (Slot {subImages.length + 1})</p>
              <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">Click to select asset</p>
            </div>
          )}
        </div>
        <input
          ref={subInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "sub")}
        />
      </div>

      {/* 裁剪弹窗 */}
      {cropImage && (
        <ImageCropper
          image={cropImage}
          open={!!cropImage}
          onClose={() => {
            setCropImage(null);
            setCurrentCropType(null);
            setCurrentEditIndex(-1);
            if (mainInputRef.current) mainInputRef.current.value = "";
            if (subInputRef.current) subInputRef.current.value = "";
          }}
          onCropComplete={handleCropComplete}
          aspectRatio={currentCropType === "main" ? mainAspectRatio : subAspectRatio}
          outputWidth={currentCropType === "main" ? mainOutputWidth : subOutputWidth}
          outputHeight={currentCropType === "main" ? mainOutputHeight : subOutputHeight}
        />
      )}
    </div>
  );
}
