"use client";

import { useCallback, useState } from "react";
import {
  processImage,
  downloadBlob,
  DEFAULT_WEBP_QUALITY,
  type ProcessedImage,
} from "@/lib/image-processor";
import { toSeoFilename } from "@/lib/seo-filename";
import { downloadAsZip } from "@/lib/zip-download";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [processed, setProcessed] = useState<ProcessedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quality = DEFAULT_WEBP_QUALITY;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setError(null);
      setLoading(true);
      const results: ProcessedImage[] = [];
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) {
        setError("이미지 파일만 업로드할 수 있습니다.");
        setLoading(false);
        return;
      }
      try {
        for (const file of imageFiles) {
          const result = await processImage(file, toSeoFilename, quality);
          results.push(result);
        }
        setProcessed((prev) => [...prev, ...results]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [quality]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const downloadOne = (item: ProcessedImage) => {
    downloadBlob(item.blob, item.seoFilename);
  };

  const downloadAll = () => {
    processed.forEach((item) => downloadBlob(item.blob, item.seoFilename));
  };

  const downloadZip = async () => {
    if (!processed.length) return;
    setZipLoading(true);
    try {
      await downloadAsZip(
        processed.map((p) => ({ blob: p.blob, filename: p.seoFilename }))
      );
    } finally {
      setZipLoading(false);
    }
  };

  const clearAll = () => setProcessed([]);

  const totalOriginal = processed.reduce((s, p) => s + p.originalSize, 0);
  const totalNew = processed.reduce((s, p) => s + p.newSize, 0);
  const totalReduction =
    totalOriginal > 0
      ? Math.round((1 - totalNew / totalOriginal) * 100)
      : 0;
  const maxBarSize = Math.max(totalOriginal, totalNew, 1);

  const formatBytes = (n: number) =>
    n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      {/* 애플 스타일 그라데이션 배경 */}
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#f5f5f7] via-[#fbfbfd] to-white"
        aria-hidden
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-14 text-center">
          <h1 className="text-[2rem] font-semibold tracking-tight text-[#1d1d1f] sm:text-[2.75rem]">
            PageSpeed 이미지 최적화
          </h1>
          <p className="mt-3 text-[1.0625rem] text-[#6e6e73]">
            WebP 변환 · 품질 {quality} · SEO 파일명
          </p>
        </header>

        {/* 드롭존 카드 (글래스) */}
        <section
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`glass-card relative overflow-hidden rounded-2xl transition-all duration-300 ${
            isDragging ? "ring-2 ring-[#0071e3] ring-offset-2" : ""
          }`}
        >
          <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 px-6 py-14">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFileInput}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="h-10 w-10 rounded-full border-2 border-[#1d1d1f] border-t-transparent animate-spin"
                  aria-hidden
                />
                <span className="animate-[shimmer_1.5s_ease-in-out_infinite] text-[1.0625rem] text-[#6e6e73]">
                  변환 중…
                </span>
                <p className="text-sm text-[#86868b]">
                  이미지를 WebP로 최적화하고 있습니다
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-full bg-[#f5f5f7] p-5 transition-transform duration-200 group-hover:scale-105">
                  <svg
                    className="h-9 w-9 text-[#6e6e73]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-center text-[1.0625rem] font-medium text-[#1d1d1f]">
                  이미지를 여기에 드래그하거나 클릭
                </span>
                <span className="text-sm text-[#86868b]">
                  품질 {quality} · SEO 친화적 파일명
                </span>
              </>
            )}
          </label>
        </section>

        {error && (
          <div
            className="mt-5 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3.5 text-sm text-red-700 backdrop-blur-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {processed.length > 0 && (
          <section className="mt-10 space-y-6">
            {/* 용량 절감 카드 (글래스) */}
            <div
              className="glass-card rounded-2xl p-6 sm:p-8"
              style={{
                animation: "fade-in-up 0.5s ease-out forwards",
              }}
            >
              <h3 className="mb-4 text-[1.125rem] font-semibold text-[#1d1d1f]">
                용량 절감률
              </h3>
              <div className="mb-5 flex items-end gap-4">
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#86868b]">
                    원본
                  </span>
                  <div
                    className="w-full min-h-[10px] rounded-lg bg-[#e8e8ed] transition-all duration-500"
                    style={{
                      height: `${Math.max(16, (totalOriginal / maxBarSize) * 100)}px`,
                    }}
                    title={formatBytes(totalOriginal)}
                  />
                  <span className="text-sm font-medium text-[#6e6e73]">
                    {formatBytes(totalOriginal)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#86868b]">
                    변환 후
                  </span>
                  <div
                    className="w-full min-h-[10px] rounded-lg bg-[#0071e3] transition-all duration-500"
                    style={{
                      height: `${Math.max(16, (totalNew / maxBarSize) * 100)}px`,
                    }}
                    title={formatBytes(totalNew)}
                  />
                  <span className="text-sm font-medium text-[#0071e3]">
                    {formatBytes(totalNew)}
                  </span>
                </div>
              </div>
              <p className="text-center text-[0.9375rem] text-[#6e6e73]">
                전체 <strong className="text-[#0071e3]">{totalReduction}%</strong> 절감
              </p>
              <div className="mt-6 space-y-3 border-t border-[#e8e8ed] pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#86868b]">
                  파일별 절감률
                </p>
                {processed.map((item, i) => {
                  const reduction =
                    item.originalSize > 0
                      ? Math.round(
                          (1 - item.newSize / item.originalSize) * 100
                        )
                      : 0;
                  return (
                    <div
                      key={`bar-${item.originalName}-${i}`}
                      className="flex items-center gap-3"
                    >
                      <span className="w-28 truncate text-sm text-[#6e6e73]">
                        {item.seoFilename.replace(/\.webp$/, "")}
                      </span>
                      <div className="flex flex-1 gap-0.5 overflow-hidden rounded-full bg-[#e8e8ed] h-2">
                        <div
                          className="rounded-l-full bg-[#d2d2d7] transition-all duration-500"
                          style={{ width: `${100 - reduction}%` }}
                        />
                        <div
                          className="rounded-r-full bg-[#0071e3] transition-all duration-500"
                          style={{ width: `${reduction}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold text-[#0071e3]">
                        {reduction}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 액션 + 결과 카드 */}
            <div
              className="flex flex-wrap items-center justify-between gap-4"
              style={{
                animation: "fade-in-up 0.5s ease-out 0.1s forwards",
                opacity: 0,
              }}
            >
              <h2 className="text-[1.125rem] font-semibold text-[#1d1d1f]">
                변환 결과 ({processed.length}개)
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadZip}
                  disabled={zipLoading}
                  className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {zipLoading ? "ZIP 생성 중…" : "ZIP으로 다운로드"}
                </button>
                <button
                  type="button"
                  onClick={downloadAll}
                  className="rounded-full border border-[#d2d2d7] bg-white/80 px-5 py-2.5 text-sm font-medium text-[#1d1d1f] backdrop-blur-sm transition-colors hover:bg-[#f5f5f7]"
                >
                  전체 다운로드
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-full border border-[#d2d2d7] bg-white/80 px-5 py-2.5 text-sm font-medium text-[#6e6e73] backdrop-blur-sm transition-colors hover:bg-[#f5f5f7]"
                >
                  비우기
                </button>
              </div>
            </div>

            <ul className="space-y-3">
              {processed.map((item, i) => (
                <li
                  key={`${item.originalName}-${i}`}
                  className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4 sm:flex-nowrap"
                  style={{
                    animation: `fade-in-up 0.5s ease-out ${0.15 + i * 0.05}s forwards`,
                    opacity: 0,
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9375rem] font-medium text-[#1d1d1f]">
                      {item.seoFilename}
                    </p>
                    <p className="mt-1 text-xs text-[#86868b]">
                      {item.width}×{item.height} · {formatBytes(item.originalSize)}{" "}
                      → {formatBytes(item.newSize)} (
                      {Math.round(
                        (1 - item.newSize / item.originalSize) * 100
                      )}
                      % 감소)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadOne(item)}
                    className="shrink-0 rounded-full border border-[#d2d2d7] bg-white/80 px-4 py-2 text-sm font-medium text-[#1d1d1f] backdrop-blur-sm transition-colors hover:bg-[#f5f5f7]"
                  >
                    다운로드
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-16 border-t border-[#e8e8ed] pt-8 text-center text-sm text-[#86868b]">
          Google PageSpeed Insights 100점을 위한 이미지 전처리 도구
          <span className="mt-2 block text-xs text-[#86868b]/80">
            브라우저에서만 처리 · 서버 저장 없이 로컬로 즉시 다운로드
          </span>
        </footer>
      </div>
    </div>
  );
}
