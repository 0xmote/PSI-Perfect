export const DEFAULT_WEBP_QUALITY = 80; // 1–100, 80 권장

export interface ProcessedImage {
  blob: Blob;
  seoFilename: string;
  originalName: string;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 로드 실패"));
    };
    img.src = url;
  });
}

function imageToWebPBlob(img: HTMLImageElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("WebP 변환 실패"));
      },
      "image/webp",
      quality
    );
  });
}

export async function processImage(
  file: File,
  toSeoFilename: (name: string) => string,
  quality: number = DEFAULT_WEBP_QUALITY
): Promise<ProcessedImage> {
  const img = await loadImage(file);
  const blob = await imageToWebPBlob(img, quality / 100);
  const seoFilename = toSeoFilename(file.name);
  return {
    blob,
    seoFilename,
    originalName: file.name,
    originalSize: file.size,
    newSize: blob.size,
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
