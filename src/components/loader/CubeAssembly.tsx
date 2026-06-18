"use client";

// CubeAssembly — "boxes fly in → assemble into a cube → the cube drops → a
// ground appears" (pure-CSS 3D, adapted from a community loader). Ported off
// styled-components: the CSS is injected via a scoped <style>, recolored for the
// dark loader (light-cobalt cube on #050505), and its generic keyframes are
// namespaced (cl-*) so they don't leak into the app. Used as the loader finale.
//
// HANDOFF TUNING — the animations run ONE cycle and HOLD their final frame
// (no infinite restart mid-curtain-lift). The final frame is aligned to where
// the R3F VoidCube hero cube sits at p=0: cube resting at viewport CENTER
// (IntroSequence grid-centers this component), grown via the .cube-loader-rig
// cl-handoff keyframe to read ~38% of viewport height, ground + masks faded
// out — so the curtain-lift crossfade reads as the SAME object igniting.
// prefers-reduced-motion: all animations off, final assembled frame rendered.

const CSS = `
.cube-loader-rig {
  --duration: 3s;
  width: 200px;
  height: 320px;
  transform-style: preserve-3d;
  animation: cl-handoff var(--duration) cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.cube-loader {
  --primary: #dfe6ff;
  --primary-light: #aebfff;
  --primary-rgba: rgba(174, 191, 255, 0);
  width: 200px;
  height: 320px;
  position: relative;
  transform-style: preserve-3d;
}
.cube-loader:before,
.cube-loader:after {
  --r: 20.5deg;
  content: "";
  width: 320px;
  height: 140px;
  position: absolute;
  right: 32%;
  bottom: -11px;
  background: #050505;
  transform: translateZ(200px) rotate(var(--r));
  animation: cl-mask var(--duration) linear forwards;
}
.cube-loader:after { --r: -20.5deg; right: auto; left: 32%; }
.cube-loader .ground {
  position: absolute;
  left: -50px;
  bottom: -120px;
  transform-style: preserve-3d;
  transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);
}
.cube-loader .ground div {
  transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0);
  width: 200px;
  height: 200px;
  background: var(--primary);
  background: linear-gradient(45deg, var(--primary) 0%, var(--primary) 50%, var(--primary-light) 50%, var(--primary-light) 100%);
  transform-style: preserve-3d;
  animation: cl-ground var(--duration) linear forwards;
}
.cube-loader .ground div:before,
.cube-loader .ground div:after {
  --rx: 90deg; --ry: 0deg; --x: 44px; --y: 162px; --z: -50px;
  content: "";
  width: 156px;
  height: 300px;
  opacity: 0;
  background: linear-gradient(var(--primary), var(--primary-rgba));
  position: absolute;
  transform: rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x), var(--y)) translateZ(var(--z));
  animation: cl-ground-shine var(--duration) linear forwards;
}
.cube-loader .ground div:after { --rx: 90deg; --ry: 90deg; --x: 0; --y: 177px; --z: 150px; }
.cube-loader .box {
  --x: 0; --y: 0;
  position: absolute;
  animation: var(--duration) linear forwards;
  transform: translate(var(--x), var(--y));
}
.cube-loader .box div {
  background-color: var(--primary);
  width: 48px;
  height: 48px;
  position: relative;
  transform-style: preserve-3d;
  animation: var(--duration) ease forwards;
  transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);
}
.cube-loader .box div:before,
.cube-loader .box div:after {
  --rx: 90deg; --ry: 0deg; --z: 24px; --y: -24px; --x: 0;
  content: "";
  position: absolute;
  background-color: inherit;
  width: inherit;
  height: inherit;
  transform: rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x), var(--y)) translateZ(var(--z));
  filter: brightness(var(--b, 1.2));
}
.cube-loader .box div:after { --rx: 0deg; --ry: 90deg; --x: 24px; --y: 0; --b: 1.4; }
.cube-loader .box.box0 { --x: -220px; --y: -120px; left: 58px; top: 108px; }
.cube-loader .box.box1 { --x: -260px; --y: 120px; left: 25px; top: 120px; }
.cube-loader .box.box2 { --x: 120px; --y: -190px; left: 58px; top: 64px; }
.cube-loader .box.box3 { --x: 280px; --y: -40px; left: 91px; top: 120px; }
.cube-loader .box.box4 { --x: 60px; --y: 200px; left: 58px; top: 132px; }
.cube-loader .box.box5 { --x: -220px; --y: -120px; left: 25px; top: 76px; }
.cube-loader .box.box6 { --x: -260px; --y: 120px; left: 91px; top: 76px; }
.cube-loader .box.box7 { --x: -240px; --y: 200px; left: 58px; top: 87px; }
.cube-loader .box0 { animation-name: box-move0; }
.cube-loader .box0 div { animation-name: box-scale0; }
.cube-loader .box1 { animation-name: box-move1; }
.cube-loader .box1 div { animation-name: box-scale1; }
.cube-loader .box2 { animation-name: box-move2; }
.cube-loader .box2 div { animation-name: box-scale2; }
.cube-loader .box3 { animation-name: box-move3; }
.cube-loader .box3 div { animation-name: box-scale3; }
.cube-loader .box4 { animation-name: box-move4; }
.cube-loader .box4 div { animation-name: box-scale4; }
.cube-loader .box5 { animation-name: box-move5; }
.cube-loader .box5 div { animation-name: box-scale5; }
.cube-loader .box6 { animation-name: box-move6; }
.cube-loader .box6 div { animation-name: box-scale6; }
.cube-loader .box7 { animation-name: box-move7; }
.cube-loader .box7 div { animation-name: box-scale7; }

@keyframes box-move0 { 12%{transform:translate(var(--x),var(--y));} 25%,52%{transform:translate(0,0);} 80%{transform:translate(0,-32px);} 90%,100%{transform:translate(10px,46px);} }
@keyframes box-scale0 { 6%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);} 14%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);} }
@keyframes box-move1 { 16%{transform:translate(var(--x),var(--y));} 29%,52%{transform:translate(0,0);} 80%{transform:translate(0,-32px);} 90%,100%{transform:translate(10px,46px);} }
@keyframes box-scale1 { 10%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);} 18%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);} }
@keyframes box-move2 { 20%{transform:translate(var(--x),var(--y));} 33%,52%{transform:translate(0,0);} 80%{transform:translate(0,-32px);} 90%,100%{transform:translate(10px,46px);} }
@keyframes box-scale2 { 14%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);} 22%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);} }
@keyframes box-move3 { 24%{transform:translate(var(--x),var(--y));} 37%,52%{transform:translate(0,0);} 80%{transform:translate(0,-32px);} 90%,100%{transform:translate(10px,46px);} }
@keyframes box-scale3 { 18%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);} 26%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);} }
@keyframes box-move4 { 28%{transform:translate(var(--x),var(--y));} 41%,52%{transform:translate(0,0);} 80%{transform:translate(0,-32px);} 90%,100%{transform:translate(10px,46px);} }
@keyframes box-scale4 { 22%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);} 30%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);} }
@keyframes box-move5 { 32%{transform:translate(var(--x),var(--y));} 45%,52%{transform:translate(0,0);} 80%{transform:translate(0,-32px);} 90%,100%{transform:translate(10px,46px);} }
@keyframes box-scale5 { 26%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);} 34%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);} }
@keyframes box-move6 { 36%{transform:translate(var(--x),var(--y));} 49%,52%{transform:translate(0,0);} 80%{transform:translate(0,-32px);} 90%,100%{transform:translate(10px,46px);} }
@keyframes box-scale6 { 30%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);} 38%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);} }
@keyframes box-move7 { 40%{transform:translate(var(--x),var(--y));} 53%,52%{transform:translate(0,0);} 80%{transform:translate(0,-32px);} 90%,100%{transform:translate(10px,46px);} }
@keyframes box-scale7 { 34%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);} 42%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);} }
@keyframes cl-ground {
  0%,65%{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(0);}
  75%,90%{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(1);}
  100%{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(0);}
}
@keyframes cl-ground-shine { 0%,70%{opacity:0;} 75%,87%{opacity:0.2;} 100%{opacity:0;} }
@keyframes cl-mask { 0%,65%{opacity:0;} 66%,88%{opacity:1;} 96%,100%{opacity:0;} }
@keyframes cl-handoff {
  0%, 84% { transform: scale(1); }
  96%, 100% { transform: scale(1.75); }
}
@media (prefers-reduced-motion: reduce) {
  .cube-loader-rig,
  .cube-loader *,
  .cube-loader:before,
  .cube-loader:after,
  .cube-loader .ground div:before,
  .cube-loader .ground div:after { animation: none !important; }
  .cube-loader-rig { transform: scale(1.75); }
  .cube-loader:before,
  .cube-loader:after { opacity: 0; }
  .cube-loader .ground div { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0); }
  .cube-loader .box { transform: translate(10px, 46px); }
  .cube-loader .box div { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); }
}
`;

export function CubeAssembly() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cube-loader-rig">
        <div className="cube-loader">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`box box${i}`}>
              <div />
            </div>
          ))}
          <div className="ground">
            <div />
          </div>
        </div>
      </div>
    </>
  );
}
