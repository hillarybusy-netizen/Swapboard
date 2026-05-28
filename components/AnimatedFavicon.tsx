"use client";
import { useEffect, useRef } from "react";

export function AnimatedFavicon() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get or create the favicon link element
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    const draw = () => {
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, 32, 32);
        link!.href = canvas.toDataURL("image/png");
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    video.play().catch(() => {});
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Hidden video used to drive the canvas favicon */}
      <video
        ref={videoRef}
        src="/logo.mp4"
        loop
        muted
        playsInline
        style={{ display: "none" }}
        aria-hidden="true"
      />
      {/* Hidden canvas to render frames */}
      <canvas
        ref={canvasRef}
        width={32}
        height={32}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </>
  );
}
