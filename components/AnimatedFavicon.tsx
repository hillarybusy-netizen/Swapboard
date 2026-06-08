"use client";
import { useEffect, useRef } from "react";

const FAVICON_INTERVAL_MS = 125; // ~8fps — same animation, far less main-thread work

export function AnimatedFavicon() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastDrawRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    const draw = (timestamp: number) => {
      if (!document.hidden && timestamp - lastDrawRef.current >= FAVICON_INTERVAL_MS) {
        if (video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, 32, 32);
          link!.href = canvas.toDataURL("image/png");
        }
        lastDrawRef.current = timestamp;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    video.play().catch(() => {});
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        src="/logo.mp4"
        loop
        muted
        playsInline
        style={{ display: "none" }}
        aria-hidden="true"
      />
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
