/**
 * 클라이언트 전용 이미지 처리 (서버 사용 없음)
 * - 모든 변환·압축은 사용자 브라우저에서만 수행됩니다.
 * - Vercel/서버 실행 시간·대역폭 제한의 영향을 받지 않습니다.
 */
import imageCompression from "browser-image-compression";

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

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 로드 실패"));
    };
    img.src = url;
  });
}

export async function processImage(
  file: File,
  toSeoFilename: (name: string) => string,
  quality: number = DEFAULT_WEBP_QUALITY
): Promise<ProcessedImage> {
  const compressed = await imageCompression(file, {
    fileType: "image/webp",
    initialQuality: quality / 100,
    useWebWorker: true,
    preserveExif: false,
  });

  const { width, height } = await getImageDimensions(compressed);
  const seoFilename = toSeoFilename(file.name);

  return {
    blob: compressed,
    seoFilename,
    originalName: file.name,
    originalSize: file.size,
    newSize: compressed.size,
    width,
    height,
  };
}

/**
 * 최적화된 이미지를 서버에 저장하지 않고 사용자 PC로 즉시 다운로드합니다.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
