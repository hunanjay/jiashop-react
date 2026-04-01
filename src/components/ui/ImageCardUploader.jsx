import { useState, useRef, useEffect } from "react";
import { ImageCropper } from "./ImageCropper";
import { Card, CardContent } from "./card";
import { Upload, X, Edit } from "lucide-react";
import { useApp } from "../../lib/app-context";
import { cn } from "../../lib/utils";

export function ImageCardUploader({ 
  value, 
  onChange, 
  onFilesSelect,
  label = "上传图片", 
  aspectRatio = 1,
  outputWidth = 800,
  outputHeight = 800,
  multiple = false,
  className 
}) {
  const { pushToast } = useApp();
  const [currentImage, setCurrentImage] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value && (!currentImage || currentImage.url !== value)) {
      setCurrentImage({
        url: value,
        originalUrl: value
      });
    } else if (!value) {
      setCurrentImage(null);
    }
  }, [value]);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (multiple && files.length > 1 && onFilesSelect) {
      const results = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        results.push(base64);
      }
      onFilesSelect(results);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      pushToast("error", "请选择图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl) => {
    setCurrentImage({
      url: croppedImageUrl,
      originalUrl: cropImage || value,
    });
    onChange(croppedImageUrl);
    setCropImage(null);
    pushToast("success", "图片上传成功");
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setCurrentImage(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (currentImage) {
      setCropImage(currentImage.originalUrl);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</h4>
      </div>
      
      {currentImage ? (
        <Card className="relative w-full overflow-hidden group border-none shadow-none bg-slate-100/50 rounded-3xl ring-1 ring-black/5 hover:ring-blue-500/20 transition-all">
          <CardContent className="p-2">
            <div className="relative bg-white rounded-[20px] overflow-hidden shadow-sm" style={{ aspectRatio }}>
              <img
                src={currentImage.url}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-950/40 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                <button
                  onClick={handleEdit}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl transition-all hover:scale-110 active:scale-90"
                >
                  <Edit className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={handleRemove}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-xl transition-all hover:scale-110 active:scale-90"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 bg-white/40 rounded-[28px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-all duration-500 group"
          style={{ aspectRatio }}
        >
          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center mb-3 group-hover:shadow-md transition-all duration-500">
             <Upload className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">上传图片</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleFileSelect}
      />

      {cropImage && (
        <ImageCropper
          image={cropImage}
          open={!!cropImage}
          onClose={() => setCropImage(null)}
          onCropComplete={handleCropComplete}
          aspectRatio={aspectRatio}
          outputWidth={outputWidth}
          outputHeight={outputHeight}
        />
      )}
    </div>
  );
}
