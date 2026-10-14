import { useState, useRef, useEffect } from "react";
import { ImageCropper } from "./ImageCropper";
import { Card, CardContent } from "./card";
import { Upload, X, Edit, Copy, ExternalLink } from "lucide-react";
import { useApp } from "../../lib/app-context";
import { api } from "../../lib/api";
import { cn } from "../../lib/utils";
import { extractClipboardImage } from "../../lib/clipboard-image";
import { normalizeOrientation, downscaleImage } from "../../lib/crop-image";

export function ImageCardUploader({ 
  value, 
  onChange, 
  onFilesSelect,
  onActivate,
  label = "上传图片", 
  aspectRatio = 1,
  outputWidth = 800,
  outputHeight = 800,
  multiple = false,
  enablePaste = true,
  enableCopy = false,
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
        const normalized = await normalizeOrientation(base64);
        results.push(await downscaleImage(normalized));
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
    reader.onload = async () => {
      const normalized = await normalizeOrientation(reader.result);
      setCropImage(normalized);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl) => {
    // For "add-new" slots (value is null) the image is owned by the parent's
    // mapped list via onChange — don't mirror it in local state or it appears twice.
    if (value !== null) {
      setCurrentImage({
        url: croppedImageUrl,
        originalUrl: cropImage || value,
      });
    }
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

  const handleCopyImage = async (event) => {
    event.stopPropagation();
    try {
      if (!navigator.clipboard?.write || !window.ClipboardItem) {
        throw new Error("当前浏览器不支持复制图片到剪贴板");
      }
      const imageUrl = currentImage.url;
      let objectKey = imageUrl.startsWith("uploads/") ? imageUrl.split("?")[0] : null;
      if (!objectKey) {
        try {
          const pathname = decodeURIComponent(new URL(imageUrl, window.location.href).pathname);
          const uploadsIndex = pathname.indexOf("/uploads/");
          if (uploadsIndex >= 0) objectKey = decodeURIComponent(pathname.slice(uploadsIndex + 1));
        } catch {
          // Non-URL values (such as data URLs) are fetched directly below.
        }
      }

      const sourceBlobPromise = objectKey
        ? api.get("/upload/image", { params: { key: objectKey }, responseType: "blob" }).then((response) => response.data)
        : fetch(imageUrl).then((response) => {
            if (!response.ok) throw new Error("图片读取失败");
            return response.blob();
          });
      const pngBlobPromise = sourceBlobPromise.then(async (sourceBlob) => {
        const bitmap = await createImageBitmap(sourceBlob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("图片转换失败");
        context.drawImage(bitmap, 0, 0);
        bitmap.close?.();
        return new Promise((resolve, reject) => {
          canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("图片转换失败")), "image/png");
        });
      });

      // Pass the pending blob to ClipboardItem immediately so the browser sees
      // the clipboard write while the click's user activation is still active.
      await navigator.clipboard.write([new window.ClipboardItem({ "image/png": pngBlobPromise })]);
      pushToast("success", "图片已复制", "可直接粘贴到其他应用");
    } catch {
      pushToast("error", "复制图片失败", "请检查登录状态和图片读取权限，或点打开原图后复制、下载。外部图片仍可能受其服务器跨域策略限制。");
    }
  };

  const handleOpenImage = (event) => {
    event.stopPropagation();
    window.open(currentImage.url, "_blank", "noopener,noreferrer");
  };

  const handlePaste = async (event) => {
    if (!enablePaste) return
    const pastedImage = await extractClipboardImage(event)
    if (!pastedImage) return

    event.preventDefault()
    event.stopPropagation()

    if (multiple && onFilesSelect) {
      const normalized = await normalizeOrientation(pastedImage)
      onFilesSelect([await downscaleImage(normalized)])
      return
    }

    const normalized = await normalizeOrientation(pastedImage)
    setCropImage(normalized)
  };

  return (
    <div
      className={cn("space-y-3 outline-none", className)}
      tabIndex={0}
      onPaste={handlePaste}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</h4>
      </div>
      
      {currentImage ? (
        <Card className="relative w-full overflow-hidden group border-none shadow-none bg-slate-100/50 rounded-3xl ring-1 ring-black/5 hover:ring-blue-500/20 transition-all">
          <CardContent className="p-2">
            <div
              className="relative bg-white rounded-[20px] overflow-hidden shadow-sm cursor-pointer"
              style={{ aspectRatio }}
              onClick={() => onActivate?.()}
            >
              <img
                src={currentImage.url}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/40 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                {enableCopy && <button type="button" onClick={handleCopyImage} title="复制图片" aria-label="复制图片" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl transition-all hover:scale-110 active:scale-90"><Copy className="h-4 w-4" /></button>}
                {enableCopy && <button type="button" onClick={handleOpenImage} title="打开原图" aria-label="打开原图" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl transition-all hover:scale-110 active:scale-90"><ExternalLink className="h-4 w-4" /></button>}
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl transition-all hover:scale-110 active:scale-90"
                >
                  <Edit className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-xl transition-all hover:scale-110 active:scale-90"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          onClick={() => onActivate?.()}
          className="w-full border-2 border-dashed border-slate-200 bg-white/40 rounded-[28px] flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/20 transition-all duration-500 group"
          style={{ aspectRatio }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate?.()
              inputRef.current?.click()
            }}
            className="h-12 w-12 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center mb-3 group-hover:shadow-md transition-all duration-500 cursor-pointer hover:scale-105 active:scale-95"
            aria-label={`上传${label}`}
          >
             <Upload className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </button>
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">上传图片</p>
          {enablePaste && <p className="mt-1 text-[9px] font-medium text-slate-400">点击后可直接 Ctrl+V 粘贴</p>}
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
