"use client";

import { useEffect, useRef, useState } from "react";

/** Conteo animado al entrar en vista; valor final de inmediato si hay
    movimiento reducido. El número final siempre queda en el HTML. */
export function CountUp({ valor }: { valor: number }) {
  const [actual, setActual] = useState(() =>
    typeof window === "undefined" ? valor : 0,
  );
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const reducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (
      reducido ||
      typeof IntersectionObserver === "undefined" ||
      !el
    ) {
      const id = window.setTimeout(() => setActual(valor), 0);
      return () => window.clearTimeout(id);
    }
    let raf = 0;
    const io = new IntersectionObserver(
      (entradas) => {
        if (!entradas[0]?.isIntersecting) return;
        io.disconnect();
        const inicio = performance.now();
        const dura = 900;
        const paso = (t: number) => {
          const p = Math.min((t - inicio) / dura, 1);
          setActual(Math.round(valor * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(paso);
        };
        raf = requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor]);

  return (
    // El servidor pinta el valor final; el cliente empieza en 0 para animar.
    <span ref={ref} className="tabular-nums" suppressHydrationWarning>
      {actual}
    </span>
  );
}
