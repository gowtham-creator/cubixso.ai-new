"use client";

import React, { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Color, Vec2 } from 'ogl';

interface GradientBackgroundProps {
    colors?: [string, string, string, string]; // 4 Hex colors
    speed?: number;       // 0.1 to 2.0
    intensity?: number;   // 0.1 to 1.0
    interactive?: boolean; // Follow mouse
    // Positioning override. Defaults to a full-screen fixed page background;
    // pass e.g. "absolute inset-0 z-0" to use it as a layer inside a parent.
    className?: string;
}

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec2 uMouse;
  uniform float uIntensity;
  varying vec2 vUv;

  // Simple noise function
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    
    // Domain Warping
    vec2 distortion = vec2(
      snoise(uv + uTime * 0.1),
      snoise(uv - uTime * 0.1)
    ) * uIntensity;

    // Interactive element
    float mouseDist = length(uv - uMouse);
    float mouseInfluence = smoothstep(0.6, 0.0, mouseDist) * uIntensity;
    
    vec2 warpedUv = uv + distortion + (uMouse - 0.5) * mouseInfluence * 0.2;
    
    // Create organic color blending
    float n1 = snoise(warpedUv * 1.5 + uTime * 0.05);
    float n2 = snoise(warpedUv * 2.0 - uTime * 0.07);
    float n3 = snoise(warpedUv * 1.0 + uTime * 0.02);

    vec3 color = mix(uColor1, uColor2, n1 * 0.5 + 0.5);
    color = mix(color, uColor3, n2 * 0.5 + 0.5);
    color = mix(color, uColor4, n3 * 0.5 + 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
    colors = ["#4f46e5", "#7c3aed", "#2563eb", "#db2777"],
    speed = 0.5,
    intensity = 0.4,
    interactive = true,
    className = "fixed inset-0 -z-10",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef(new Vec2(0.5, 0.5));

    useEffect(() => {
        if (!containerRef.current) return;

        const renderer = new Renderer({ alpha: true, dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 1 });
        const gl = renderer.gl;
        containerRef.current.appendChild(gl.canvas);

        const geometry = new Geometry(gl, {
            position: { size: 3, data: new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]) },
            uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
        });

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new Color(colors[0]) },
                uColor2: { value: new Color(colors[1]) },
                uColor3: { value: new Color(colors[2]) },
                uColor4: { value: new Color(colors[3]) },
                uMouse: { value: mouseRef.current },
                uIntensity: { value: intensity },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });

        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!interactive) return;
            // Normalize mouse to 0.0 - 1.0
            mouseRef.current.set(
                e.clientX / window.innerWidth,
                1.0 - e.clientY / window.innerHeight
            );
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        handleResize();

        let rafId: number;
        const update = (t: number) => {
            rafId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001 * speed;
            program.uniforms.uMouse.value = mouseRef.current;
            renderer.render({ scene: mesh });
        };

        rafId = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafId);
            if (containerRef.current) {
                containerRef.current.removeChild(gl.canvas);
            }
        };
    }, [colors, speed, intensity, interactive]);

    return (
        <div
            ref={containerRef}
            className={`${className} w-full h-full overflow-hidden`}
            style={{ filter: 'blur(40px) saturate(120%)' }} // CSS Blur adds that extra softness
        />
    );
};