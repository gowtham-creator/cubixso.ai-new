"use client";

import React, { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Vec2, Color } from 'ogl';

interface PrismProps {
    baseColor?: string;      // The deep background (usually dark)
    accentColor?: string;    // The color of the "light" passing through
    dispersion?: number;     // How much the RGB splits (0.0 - 0.2)
    speed?: number;          // Speed of the flow
    className?: string;
}

const VERTEX_SHADER = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform float uDispersion;
  uniform float uSpeed;

  varying vec2 vUv;

  // Optimized Simplex Noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= aspect;

    float t = uTime * uSpeed;

    // Displacement map based on noise
    // We sample noise 3 times with slight offsets for RGB
    float d1 = snoise(p * 0.5 + t * 0.1);
    float d2 = snoise(p * 0.5 + t * 0.1 + vec2(uDispersion));
    float d3 = snoise(p * 0.5 + t * 0.1 - vec2(uDispersion));

    // Mouse influence
    float mDist = distance(uv, uMouse);
    float mStrength = smoothstep(0.5, 0.0, mDist) * 0.1;
    
    // RGB Channel Calculation
    float r = snoise(p + d1 + mStrength);
    float g = snoise(p + d2 + mStrength);
    float b = snoise(p + d3 + mStrength);

    // Create the "Prism" color by mixing the shifted channels
    vec3 prismColor = vec3(r, g, b);
    
    // Blend with base and accent colors
    vec3 finalColor = mix(uBaseColor, uAccentColor, prismColor * 0.5 + 0.5);

    // Add a sharp Specular "Sheen"
    float sheen = pow(max(0.0, g), 10.0) * 0.3;
    finalColor += sheen;

    // Grain for that 2025 premium look
    float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) * 0.04;
    finalColor += grain;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const UiloraPrismDispersion: React.FC<PrismProps> = ({
    baseColor = "#030303",
    accentColor = "#202025",
    dispersion = 0.05,
    speed = 0.4,
    className = "",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef(new Vec2(0.5, 0.5));
    const targetMousePos = useRef(new Vec2(0.5, 0.5));

    useEffect(() => {
        if (!containerRef.current) return;
        const renderer = new Renderer({ alpha: false, antialias: true });
        const gl = renderer.gl;
        gl.canvas.style.display = 'block';
        containerRef.current.appendChild(gl.canvas);

        const geometry = new Geometry(gl, {
            position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
            uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
        });

        const program = new Program(gl, {
            vertex: VERTEX_SHADER,
            fragment: FRAGMENT_SHADER,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new Vec2() },
                uMouse: { value: mousePos.current },
                uBaseColor: { value: new Color(baseColor) },
                uAccentColor: { value: new Color(accentColor) },
                uDispersion: { value: dispersion },
                uSpeed: { value: speed },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });

        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            renderer.setSize(w, h);
            program.uniforms.uResolution.value.set(w, h);
        };
        window.addEventListener('resize', resize);
        resize();

        const onMouseMove = (e: MouseEvent) => {
            targetMousePos.current.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', onMouseMove);

        let requestId: number;
        const update = (t: number) => {
            requestId = requestAnimationFrame(update);
            mousePos.current.lerp(targetMousePos.current, 0.05);
            program.uniforms.uTime.value = t * 0.001;
            renderer.render({ scene: mesh });
        };
        requestId = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(requestId);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            if (containerRef.current?.contains(gl.canvas)) containerRef.current.removeChild(gl.canvas);
        };
    }, [baseColor, accentColor, dispersion, speed]);

    return <div ref={containerRef} className={`fixed inset-0 z-[-1] w-full h-full bg-black ${className}`} />;
};

export default UiloraPrismDispersion;