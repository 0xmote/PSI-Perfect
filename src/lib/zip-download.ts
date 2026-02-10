import JSZip from "jszip";

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
