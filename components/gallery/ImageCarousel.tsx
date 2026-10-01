"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

type CarouselImage = { src: string; alt: string };

export default function ImageCarousel({ images }: { images: CarouselImage[] }) {
  const [current, setCurrent] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const currentRef = useRef(0);
  const pausedRef = useRef(false);

  const n = images.length;

  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goTo = useCallback((i: number) => setCurrent(((i % n) + n) % n), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(currentRef.current - 1);
      if (e.key === "ArrowRight") goTo(currentRef.current + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  // Global pointerup/pointercancel so a stray release outside the stage
  // can never leave `dragging`/`paused` stuck true and kill autoplay.
  useEffect(() => {
    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      const delta = e.clientX - startX.current;
      if (delta > 60) goTo(currentRef.current - 1);
      else if (delta < -60) goTo(currentRef.current + 1);
      setPaused(false);
    };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [goTo]);

  // Autoplay: one interval for the whole lifetime of the component.
  // Reads current/paused from refs so it's immune to re-renders or
  // effect dependency churn — it just keeps ticking every 10s.
  // No hover-pause: the carousel autoplays regardless of cursor position,
  // and only pauses while the user is actively dragging it.
  useEffect(() => {
    if (n <= 1) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      goTo(currentRef.current + 1);
    }, 10000);
    return () => clearInterval(id);
  }, [n, goTo]);

  if (n === 0) {
    return <p className="text-center text-[#8b93b8] py-20">No images found.</p>;
  }

  const spacing = mobile ? 150 : 230;
  const maxRot = mobile ? 34 : 46;

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    setPaused(true);
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 overflow-hidden">
      {/* Stage */}
      <div
        onPointerDown={onPointerDown}
        className="relative [perspective:1600px] cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ height: mobile ? 380 : 420 }}
      >
        <div className="relative w-full h-full [transform-style:preserve-3d]">
          {images.map((img, i) => {
            let d = i - current;
            if (d > n / 2) d -= n;
            if (d < -n / 2) d += n;

            const absD = Math.min(Math.abs(d), 3);
            const tx = d * spacing;
            const rot = Math.max(-maxRot, Math.min(maxRot, d * 30));
            const scale = 1 - absD * 0.14;
            const ty = absD * 22;
            const opacity = absD > 3 ? 0 : 1 - absD * 0.28;
            const z = 100 - Math.abs(d);
            const active = d === 0;

            return (
              <div
                key={img.src}
                onClick={() => !active && goTo(i)}
                className={`absolute top-1/2 left-1/2 rounded-[18px] overflow-hidden border
                  transition-[transform,opacity,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,.9,.32,1)]
                  select-none
                  ${active
                    ? "border-[#c9a24b]/55 shadow-[0_34px_70px_-18px_rgba(0,0,0,.75),0_0_0_1px_rgba(201,162,75,0.12)] cursor-default"
                    : "border-[#c9a24b]/18 shadow-[0_30px_60px_-20px_rgba(0,0,0,.65)] cursor-pointer"
                  }`}
                style={{
                  width: mobile ? 230 : 280,
                  height: mobile ? 300 : 340,
                  marginTop: mobile ? -150 : -170,
                  marginLeft: mobile ? -115 : -140,
                  transform: `translateX(${tx}px) translateY(${ty}px) rotateY(${-rot}deg) scale(${scale})`,
                  opacity,
                  zIndex: z,
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="280px"
                  className="object-cover"
                  priority={i === current}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-1">
        <button
          onClick={() => goTo(current - 1)}
          aria-label="Previous"
          className="w-11 h-11 rounded-full border border-[#c9a24b]/35 text-[#e6cd8a] text-xl
                     hover:bg-[#c9a24b]/10 hover:border-[#c9a24b] active:scale-95 transition"
        >
          ‹
        </button>

        <div className="flex gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              onClick={() => goTo(i)}
              className={`h-[7px] rounded-full cursor-pointer transition-all duration-250
                ${i === current ? "w-[22px] bg-[#c9a24b] rounded-[4px]" : "w-[7px] bg-[#c9a24b]/28"}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(current + 1)}
          aria-label="Next"
          className="w-11 h-11 rounded-full border border-[#c9a24b]/35 text-[#e6cd8a] text-xl
                     hover:bg-[#c9a24b]/10 hover:border-[#c9a24b] active:scale-95 transition"
        >
          ›
        </button>
      </div>
    </div>
  );
}