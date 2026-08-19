import { useEffect, useRef, useState } from "react";

type Ripple = { id: number; x: number; y: number };

/**
 * Magnetic blob cursor: a soft squishy blob that stretches toward motion,
 * morphs into a pill on hoverable elements, with a subtle blur glow.
 * Emits a ripple burst on click / touch.
 */
export function CustomCursor() {
  const blobRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);
  const hoverRef = useRef(false);
  const pressedRef = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;

    if (fine) {
      setEnabled(true);
      document.documentElement.classList.add("cursor-none-root");
    }

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const blob = { x: target.x, y: target.y };
    const dot = { x: target.x, y: target.y };
    const vel = { x: 0, y: 0 };
    let lastT = performance.now();
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const tick = (t: number) => {
      const dt = Math.min(64, t - lastT);
      lastT = t;

      // Springy blob
      const easeBlob = 0.22;
      const nx = blob.x + (target.x - blob.x) * easeBlob;
      const ny = blob.y + (target.y - blob.y) * easeBlob;
      vel.x = (nx - blob.x) / (dt / 16 || 1);
      vel.y = (ny - blob.y) / (dt / 16 || 1);
      blob.x = nx;
      blob.y = ny;

      // Snappier dot
      dot.x += (target.x - dot.x) * 0.6;
      dot.y += (target.y - dot.y) * 0.6;

      const speed = Math.min(60, Math.hypot(vel.x, vel.y));
      const angle = (Math.atan2(vel.y, vel.x) * 180) / Math.PI;

      // Stretch factor: more speed = more elongated. Hover forces pill shape.
      const stretch = hoverRef.current
        ? 1.35
        : 1 + speed * 0.018;
      const squash = hoverRef.current
        ? 0.75
        : Math.max(0.65, 1 - speed * 0.012);

      const baseSize = hoverRef.current ? 64 : 40;
      const pressScale = pressedRef.current ? 0.82 : 1;

      if (blobRef.current) {
        blobRef.current.style.width = `${baseSize}px`;
        blobRef.current.style.height = `${baseSize}px`;
        blobRef.current.style.transform =
          `translate3d(${blob.x}px, ${blob.y}px, 0) translate(-50%, -50%) ` +
          `rotate(${angle}deg) scale(${stretch * pressScale}, ${squash * pressScale})`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${blob.x}px, ${blob.y}px, 0) translate(-50%, -50%)`;
        glowRef.current.style.opacity = hoverRef.current ? "0.9" : "0.55";
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
        dotRef.current.style.opacity = hoverRef.current ? "0" : "1";
      }

      raf = requestAnimationFrame(tick);
    };
    if (fine) raf = requestAnimationFrame(tick);

    const isInteractive = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      return !!node?.closest?.(
        'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="hover"]',
      );
    };
    const onOver = (e: PointerEvent) => {
      const h = isInteractive(e.target);
      hoverRef.current = h;
      setHovering(h);
    };

    const emitRipple = (x: number, y: number) => {
      const id = ++rippleId.current;
      setRipples((r) => [...r, { id, x, y }]);
      window.setTimeout(() => {
        setRipples((r) => r.filter((rp) => rp.id !== id));
      }, 700);
    };

    const onDown = (e: PointerEvent) => {
      pressedRef.current = true;
      emitRipple(e.clientX, e.clientY);
    };
    const onUp = () => {
      pressedRef.current = false;
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerover", onOver, { passive: true });
      window.addEventListener("pointerup", onUp);
      document.addEventListener("mouseleave", onLeave);
      document.addEventListener("mouseenter", onEnter);
    }
    window.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("cursor-none-root");
    };
  }, [visible]);

  const shown = visible ? "opacity-100" : "opacity-0";

  return (
    <>
      {enabled && (
        <>
          {/* Soft blur glow behind blob */}
          <div
            ref={glowRef}
            aria-hidden
            className={`pointer-events-none fixed left-0 top-0 z-[9997] rounded-full transition-opacity duration-300 ${shown}`}
            style={{
              width: 120,
              height: 120,
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--accent) 45%, transparent) 0%, transparent 65%)",
              filter: "blur(10px)",
              transform: "translate3d(-200px,-200px,0) translate(-50%,-50%)",
            }}
          />
          {/* The magnetic blob */}
          <div
            ref={blobRef}
            aria-hidden
            className={`pointer-events-none fixed left-0 top-0 z-[9999] transition-[border-radius,background-color,width,height,opacity] duration-300 ease-out ${shown}`}
            style={{
              borderRadius: hovering ? "999px" : "46% 54% 52% 48% / 50% 46% 54% 50%",
              background: hovering
                ? "color-mix(in oklab, var(--accent) 22%, transparent)"
                : "color-mix(in oklab, var(--accent) 35%, transparent)",
              border: `1.5px solid color-mix(in oklab, var(--accent) ${hovering ? 90 : 70}%, transparent)`,
              backdropFilter: "invert(1) hue-rotate(180deg)",
              WebkitBackdropFilter: "invert(1) hue-rotate(180deg)",
              transform: "translate3d(-200px,-200px,0) translate(-50%,-50%)",
              willChange: "transform, border-radius",
            }}
          />
          {/* Center dot for precision */}
          <div
            ref={dotRef}
            aria-hidden
            className={`pointer-events-none fixed left-0 top-0 z-[10000] rounded-full transition-opacity duration-200 ${shown}`}
            style={{
              width: 5,
              height: 5,
              background: "var(--accent)",
              boxShadow: "0 0 8px color-mix(in oklab, var(--accent) 80%, transparent)",
              transform: "translate3d(-200px,-200px,0) translate(-50%,-50%)",
            }}
          />
        </>
      )}

      {/* Click / touch ripples */}
      <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden">
        {ripples.map((r) => (
          <span key={r.id} className="cursor-ripple-wrap" style={{ left: r.x, top: r.y }}>
            <span className="cursor-ripple cursor-ripple--core" />
            <span className="cursor-ripple cursor-ripple--ring" />
            <span className="cursor-ripple cursor-ripple--ring cursor-ripple--ring-delay" />
          </span>
        ))}
      </div>
    </>
  );
}
