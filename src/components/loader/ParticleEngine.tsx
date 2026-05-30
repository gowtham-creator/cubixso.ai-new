"use client";

// ParticleEngine — port of Axshatt/ParticleText (single-file canvas engine)
// adapted for the Cubixso brand. Renders ~5000–8000 particles that morph
// between an idle Fibonacci sphere and rasterized text shapes via per-frame
// lerping. Float32Arrays for zero-GC. Used inside the Preloader finale.
//
// Public ref API:
//   setText(phrase) → particles transit to form the phrase
//   setSphere()     → particles return to idle sphere
//   explode()       → particles fly outward + fade (transition out)
//
// Theme-aware: dark-mode uses brand cobalt + accent glow on cyan-white;
// light-mode mutes toward deep-cobalt + black points.

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

export interface ParticleEngineHandle {
  setText: (phrase: string) => void;
  setSphere: () => void;
  explode: () => void;
}

interface ParticleEngineProps {
  count?: number;
  themeIsDark?: boolean;
  className?: string;
}

export const ParticleEngine = forwardRef<ParticleEngineHandle, ParticleEngineProps>(
  function ParticleEngine({ count = 6000, themeIsDark = true, className = "" }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<"sphere" | "text" | "explode">("sphere");

    // Imperative API
    useImperativeHandle(ref, () => ({
      setText: (phrase: string) => formText(phrase),
      setSphere: () => returnToSphere(),
      explode: () => triggerExplode(),
    }));

    // Refs to engine internals so the imperative methods can drive them
    const apiRef = useRef<{
      formText: (s: string) => void;
      returnToSphere: () => void;
      explode: () => void;
    } | null>(null);

    const formText = (s: string) => apiRef.current?.formText(s);
    const returnToSphere = () => apiRef.current?.returnToSphere();
    const triggerExplode = () => apiRef.current?.explode();

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const N = count;
      const px = new Float32Array(N);
      const py = new Float32Array(N);
      const pz = new Float32Array(N);
      const vx = new Float32Array(N);
      const vy = new Float32Array(N);
      const vz = new Float32Array(N);
      const tx = new Float32Array(N);
      const ty = new Float32Array(N);
      const tz = new Float32Array(N);
      const ox = new Float32Array(N);
      const oy = new Float32Array(N);
      const oz = new Float32Array(N);
      const phase = new Float32Array(N);
      const hue = new Float32Array(N);

      let W = 0, H = 0, CX = 0, CY = 0, dpr = 1;
      let t = 0;
      let rotY = 0;
      let mouseX = -9999, mouseY = -9999;
      let lifeFade = 1;

      const PHI = Math.PI * (1 + Math.sqrt(5));
      const FOV = 550;
      const CAMERA_Z = 600;
      const REPEL_RADIUS = 110;
      const REPEL_FORCE = 8;

      function initSphereTargets() {
        const baseDim = Math.min(W, H);
        const R = baseDim > 1200 ? baseDim * 0.26 : baseDim * 0.4;
        for (let i = 0; i < N; i++) {
          const polar = Math.acos(1 - (2 * (i + 0.5)) / N);
          const azim = PHI * i;
          ox[i] = Math.sin(polar) * Math.cos(azim) * R;
          oy[i] = Math.sin(polar) * Math.sin(azim) * R;
          oz[i] = Math.cos(polar) * R;
          tx[i] = ox[i];
          ty[i] = oy[i];
          tz[i] = oz[i];
        }
      }

      function initParticles() {
        for (let i = 0; i < N; i++) {
          px[i] = (Math.random() - 0.5) * W * 2;
          py[i] = (Math.random() - 0.5) * H * 2;
          pz[i] = (Math.random() - 0.5) * 1000;
          vx[i] = vy[i] = vz[i] = 0;
          phase[i] = Math.random() * Math.PI * 2;
          hue[i] = (i / N) * 240 + 200;   // cobalt range
        }
      }

      function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        W = window.innerWidth;
        H = window.innerHeight;
        CX = W / 2;
        CY = H / 2;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (stateRef.current === "sphere") initSphereTargets();
      }

      function sampleTextPositions(phrase: string): number[] {
        const cW = Math.floor(W);
        const cH = Math.floor(H);
        const off = document.createElement("canvas");
        off.width = cW;
        off.height = cH;
        const c2 = off.getContext("2d");
        if (!c2) return [];
        const words = phrase.split(" ");
        const lines: string[] = [];
        let cur = "";
        const maxChars = phrase.length > 25 ? 12 : 20;
        words.forEach((w) => {
          if ((cur + w).length > maxChars) {
            lines.push(cur.trim());
            cur = w + " ";
          } else cur += w + " ";
        });
        lines.push(cur.trim());
        let fs = Math.min((cW * 0.72) / (maxChars * 0.5), (cH * 0.5) / lines.length, 180);
        if (phrase.length > 30) fs *= 0.8;
        c2.fillStyle = "#fff";
        c2.font = `900 ${fs}px Inter, "SF Pro Display", system-ui, sans-serif`;
        c2.textAlign = "center";
        c2.textBaseline = "middle";
        const lh = fs * 1.1;
        const startY = cH / 2 - ((lines.length - 1) * lh) / 2;
        lines.forEach((ln, i) => c2.fillText(ln, cW / 2, startY + i * lh));
        const data = c2.getImageData(0, 0, cW, cH).data;
        const pts: number[] = [];
        const step = phrase.length > 30 ? 2 : 1;
        for (let y = 0; y < cH; y += step) {
          for (let x = 0; x < cW; x += step) {
            if (data[(y * cW + x) * 4 + 3] > 120) {
              pts.push(
                x - cW / 2 + (Math.random() - 0.5) * 0.8,
                y - cH / 2 + (Math.random() - 0.5) * 0.8,
              );
            }
          }
        }
        // shuffle
        for (let i = pts.length / 2 - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const ia = i * 2, ja = j * 2;
          let tmp = pts[ia]; pts[ia] = pts[ja]; pts[ja] = tmp;
          tmp = pts[ia + 1]; pts[ia + 1] = pts[ja + 1]; pts[ja + 1] = tmp;
        }
        return pts;
      }

      function update() {
        t += 0.005;
        if (stateRef.current === "sphere") rotY += 0.006;
        const jitter = stateRef.current === "sphere" ? 1.8 : 0;

        // Explode lifeFade decay
        if (stateRef.current === "explode") lifeFade = Math.max(0, lifeFade - 0.018);

        for (let i = 0; i < N; i++) {
          let cTx = tx[i], cTy = ty[i], cTz = tz[i];
          const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
          let targetX = cTx * cosY - cTz * sinY;
          let targetY = cTy;
          let targetZ = cTx * sinY + cTz * cosY;

          if (stateRef.current === "sphere") {
            targetX += Math.sin(t * 8 + phase[i]) * jitter;
            targetY += Math.cos(t * 9 + phase[i]) * jitter;
            targetZ += Math.sin(t * 7 + phase[i] * 2) * jitter;
          } else if (stateRef.current === "explode") {
            // Push targets radially outward from origin
            const len = Math.hypot(targetX, targetY, targetZ) || 1;
            targetX += (targetX / len) * 60;
            targetY += (targetY / len) * 60;
            targetZ += (targetZ / len) * 60;
          }

          const sp = stateRef.current === "sphere" ? 0.02
                   : stateRef.current === "text"   ? 0.025
                   :                                  0.018;
          vx[i] += (targetX - px[i]) * sp;
          vy[i] += (targetY - py[i]) * sp;
          vz[i] += (targetZ - pz[i]) * sp;

          if (stateRef.current !== "sphere" && mouseX > 0) {
            const scale = FOV / (FOV + pz[i] + CAMERA_Z);
            const sx = px[i] * scale + CX;
            const sy = py[i] * scale + CY;
            const dx = sx - mouseX, dy = sy - mouseY;
            const d2 = dx * dx + dy * dy;
            if (d2 < REPEL_RADIUS * REPEL_RADIUS && d2 > 1) {
              const d = Math.sqrt(d2);
              const mag = REPEL_FORCE * (1 - d / REPEL_RADIUS) * 5;
              vx[i] += (dx / d) * mag;
              vy[i] += (dy / d) * mag;
            }
          }

          vx[i] *= 0.82;
          vy[i] *= 0.82;
          vz[i] *= 0.82;
          px[i] += vx[i];
          py[i] += vy[i];
          pz[i] += vz[i];
        }
      }

      function draw() {
        // Background clear with a controlled trail. Lower alpha on text state
        // for crisper letterforms; slightly higher on sphere for organic smear.
        const trailA =
          stateRef.current === "text"   ? 0.42
        : stateRef.current === "explode" ? 0.30
        :                                  0.20;
        ctx!.globalCompositeOperation = "source-over";
        ctx!.fillStyle = themeIsDark
          ? `rgba(0,0,0,${trailA})`
          : `rgba(245,245,247,${trailA})`;
        ctx!.fillRect(0, 0, W, H);

        // Additive ("lighter") stacks brights toward white — gorgeous on a
        // black field, but it BLOWS OUT on the light background (everything
        // washes to white). So only go additive in dark mode; light mode
        // paints normally so the dark cobalt particles stay legible.
        ctx!.globalCompositeOperation = themeIsDark ? "lighter" : "source-over";

        for (let i = 0; i < N; i++) {
          const zPos = pz[i] + CAMERA_Z;
          if (zPos < 10) continue;
          const scale = FOV / zPos;
          const sx = px[i] * scale + CX;
          const sy = py[i] * scale + CY;
          const spd = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i]);
          let a = Math.min(1, (0.22 + spd * 0.12) * (scale * 0.7)) * lifeFade;
          let coreSize = (0.55 + spd * 0.12) * scale;

          let h: number, s: number, l: number;
          if (stateRef.current === "text") {
            // Sharp brand cobalt with white-hot core in text mode
            h = 222; s = 95; l = themeIsDark ? 70 : 42;
            a = Math.min(1, a * 1.85);
            coreSize *= 1.0;
          } else if (stateRef.current === "explode") {
            h = 222; s = 88; l = themeIsDark ? 78 : 45;
            a *= 0.85;
          } else {
            // Sphere — slow cobalt hue drift, denser than before
            h = 215 + Math.sin(t * 0.6 + i * 0.001) * 14;
            s = 82;
            l = themeIsDark ? 68 : 44;
          }

          // Halo — wider, low-alpha disc behind each particle for soft bloom
          if (stateRef.current === "text") {
            ctx!.beginPath();
            ctx!.arc(sx, sy, coreSize * 3.0, 0, 6.2832);
            ctx!.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${a * 0.16})`;
            ctx!.fill();
          }

          // Core
          ctx!.beginPath();
          ctx!.arc(sx, sy, coreSize, 0, 6.2832);
          ctx!.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
          ctx!.fill();
        }

        // Reset blend mode so subsequent overlays (none right now) draw normal
        ctx!.globalCompositeOperation = "source-over";
      }

      let raf = 0;
      function loop() {
        update();
        draw();
        raf = requestAnimationFrame(loop);
      }

      // ─── Imperative API ──
      apiRef.current = {
        formText: (phrase: string) => {
          stateRef.current = "text";
          const pts = sampleTextPositions(phrase);
          const pCount = pts.length / 2;
          if (pCount === 0) return;
          for (let i = 0; i < N; i++) {
            const idx = (i % pCount) * 2;
            tx[i] = pts[idx];
            ty[i] = pts[idx + 1];
            tz[i] = 0;
          }
          rotY = 0;
          t = 0;
        },
        returnToSphere: () => {
          stateRef.current = "sphere";
          initSphereTargets();
        },
        explode: () => {
          stateRef.current = "explode";
          // velocity kick — give particles initial outward burst
          for (let i = 0; i < N; i++) {
            const len = Math.hypot(px[i], py[i], pz[i]) || 1;
            vx[i] += (px[i] / len) * 18;
            vy[i] += (py[i] / len) * 18;
            vz[i] += (pz[i] / len) * 18;
          }
        },
      };

      const onMove = (e: PointerEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
      const onLeave = () => { mouseX = -9999; mouseY = -9999; };
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);

      resize();
      initParticles();
      initSphereTargets();
      loop();

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
      };
    }, [count, themeIsDark]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 ${className}`}
      />
    );
  },
);
