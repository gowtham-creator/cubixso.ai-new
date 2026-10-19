// One dynamic entry for both homepage canvases. Imported separately through
// next/dynamic, Turbopack emitted a full, byte-identical copy of three + R3F
// (~230 KB transferred) into each canvas's async chunk. Behind a single entry
// the two share one chunk group, so the 3D stack downloads once. Nothing here
// runs side effects: this module now loads for the hero too, so the scroller's
// GLB/Draco preload is a function its wrapper calls, not module-scope code.
export { default as HeroGlassCubeCanvas } from "./HeroGlassCubeCanvas";
export { default as CubeScrollerCanvas, preloadScrollerModel } from "./CubeScrollerCanvas";
