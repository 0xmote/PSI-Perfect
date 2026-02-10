/**
 * SEO 친화적 파일명 규칙 적용
 * - 소문자
 * - 공백 → 하이픈
 * - 특수문자 제거 (영문, 숫자, 하이픈만 유지)
 * - 연속 하이픈 정리
 * - 확장자는 .webp로 고정
 */
export function toSeoFilename(originalName: string): string {
  const withoutExt = originalName.replace(/\.[^.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "") // SEO: 영문·숫자·하이픈만
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "image";
  return `${slug}.webp`;
}
