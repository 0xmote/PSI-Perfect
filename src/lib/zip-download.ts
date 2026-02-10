import JSZip from "jszip";

/**
 * 최적화된 파일들을 서버에 올리지 않고, 사용자 PC로 ZIP으로 즉시 다운로드합니다.
 */
export async function downloadAsZip(
  files: { blob: Blob; filename: string }[]
): Promise<void> {
  const zip = new JSZip();
  for (const { blob, filename } of files) {
    zip.file(filename, blob);
  }
  const content = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = `psi-perfect-images-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);
}
