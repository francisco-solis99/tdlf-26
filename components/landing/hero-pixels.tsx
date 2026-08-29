"use client";

import { useEffect, useRef } from "react";

type Dot = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  r: number;
};

export function HeroPixels() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const hero = document.getElementById("top");
    if (!canvas || !hero) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let dots: Dot[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const mouse = { x: -9999, y: -9999, active: false };

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function resize() {
      if (!hero || !canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initDots();
    }

    function initDots() {
      dots = [];
      const isMobile = w < 640;
      const gap = isMobile ? 32 : 28;
      const cols = Math.ceil(w / gap);
      const rows = Math.ceil(h / gap);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * gap + (y % 2 ? gap / 2 : 0) + (Math.random() - 0.5) * 3;
          const py = y * gap + (Math.random() - 0.5) * 3;

          // uniform edge-to-edge — no donut/outer filters
          dots.push({
            ox: px,
            oy: py,
            x: px,
            y: py,
            vx: 0,
            vy: 0,
            rot: (Math.random() - 0.5) * 0.4,
            vr: 0,
            r: Math.random() > 0.88 ? 1.45 : 1.05,
          });
        }
      }
    }

    function onMove(e: MouseEvent) {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }

    function onLeave() {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function tick() {
      if (prefersReduced.matches || !ctx) return;
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        if (mouse.active) {
          const dx = mouse.x - d.x;
          const dy = mouse.y - d.y;
          const dist = Math.hypot(dx, dy);
          const radius = 130;
          if (dist < radius && dist > 2) {
            const force = (1 - dist / radius) * 6.5;
            const angle = Math.atan2(dy, dx);
            // repel — gravity-like push
            d.vx -= Math.cos(angle) * force * 0.7;
            d.vy -= Math.sin(angle) * force * 0.7;
            d.vr += (force * 0.045) * (dx > 0 ? 1 : -1);
          }
        }

        // spring back to origin
        d.vx += (d.ox - d.x) * 0.025;
        d.vy += (d.oy - d.y) * 0.025;
        d.vr += -d.rot * 0.02;

        d.vx *= 0.88;
        d.vy *= 0.88;
        d.vr *= 0.88;

        d.x += d.vx;
        d.y += d.vy;
        d.rot += d.vr;

        // draw — small square so rotation is visible (pixel look), lightweight
        if (!ctx) return;
        const s = d.r * 2;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.fillStyle = "rgba(255,77,61,0.55)";
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    }

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);
    resize();
    tick();

    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-[0.7]"
    />
  );
}
