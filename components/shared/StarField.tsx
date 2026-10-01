"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  depth: number; // parallax weight, 0.2–1
};

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let stars: Star[] = [];
    let rafId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // mouse state — smoothed for a calmer, more premium feel
    const mouse = { x: -9999, y: -9999, active: false };
    const smoothMouse = { x: -9999, y: -9999 };

    const resize = () => {
      const hero = canvas.parentElement;
      if (!hero) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = hero.offsetWidth * dpr;
      canvas.height = hero.offsetHeight * dpr;
      canvas.style.width = `${hero.offsetWidth}px`;
      canvas.style.height = `${hero.offsetHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = hero.offsetWidth;
      const h = hero.offsetHeight;
      const count = Math.floor((w * h) / 8500);

      stars = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          x,
          y,
          baseX: x,
          baseY: y,
          r: Math.random() * 1.4 + 0.4,
          baseAlpha: Math.random() * 0.55 + 0.25,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.005,
          depth: Math.random() * 0.8 + 0.2,
        };
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = (t: number) => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      // smooth the cursor position toward the raw mouse position
      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.08;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.08;

      // gentle parallax: stars drift opposite the cursor based on depth
      const parallaxStrength = 18;
      const cx = w / 2;
      const cy = h / 2;
      const nx = mouse.active ? (smoothMouse.x - cx) / cx : 0;
      const ny = mouse.active ? (smoothMouse.y - cy) / cy : 0;

      stars.forEach((s) => {
        s.x = s.baseX - nx * parallaxStrength * s.depth;
        s.y = s.baseY - ny * parallaxStrength * s.depth;
      });

      // connecting lines — subtle base network, brighter near cursor
      ctx.lineWidth = 1;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i];
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const distToCursor = mouse.active
              ? Math.hypot(midX - smoothMouse.x, midY - smoothMouse.y)
              : Infinity;
            const cursorBoost =
              distToCursor < 160 ? (1 - distToCursor / 160) * 0.5 : 0;

            const alpha = (1 - dist / 90) * 0.3 + cursorBoost;
            ctx.strokeStyle = `rgba(201,162,39,${Math.min(alpha, 0.65)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // stars — twinkle + proximity glow near cursor
      stars.forEach((s) => {
        const twinkle = reduceMotion
          ? 0
          : Math.sin(t * s.speed + s.phase) * 0.25;

        const distToCursor = mouse.active
          ? Math.hypot(s.x - smoothMouse.x, s.y - smoothMouse.y)
          : Infinity;
        const proximity =
          distToCursor < 130 ? 1 - distToCursor / 130 : 0;

        const alpha = Math.max(0, s.baseAlpha + twinkle + proximity * 0.5);
        const radius = s.r + proximity * 1.6;

        if (proximity > 0.05) {
          // soft glow halo for stars near the cursor
          const glow = ctx.createRadialGradient(
            s.x,
            s.y,
            0,
            s.x,
            s.y,
            radius * 4
          );
          glow.addColorStop(0, `rgba(246,229,180,${proximity * 0.35})`);
          glow.addColorStop(1, "rgba(246,229,180,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(s.x, s.y, radius * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(246,229,180,${Math.min(alpha, 1)})`;
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!reduceMotion || mouse.active) rafId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    rafId = requestAnimationFrame(draw);
    if (reduceMotion) draw(0);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 cursor-default"
    />
  );
}