// The single dynamic entry for every 3D module that can load on the homepage
// (hero cube, cube scroller, globe, mascot). Imported separately through
// next/dynamic or import(), Turbopack emitted a full, byte-identical copy of
// three + R3F (~230 KB transferred) into each entry's async chunk group. Behind
// one entry they share a chunk group, so the 3D stack downloads once. Nothing
// here runs side effects: this module loads for whichever component needs it
// first, so model/texture preloads are functions the specific wrapper calls
// when that component is armed, never module-scope code.
export { default as HeroGlassCubeCanvas } from "./HeroGlassCubeCanvas";
export { default as CubeScrollerCanvas, preloadScrollerModel } from "./CubeScrollerCanvas";
export { Globe3D, preloadGlobeTextures } from "@/components/ui/3d-globe";
export { SplineMascot, preloadMascotModel } from "./SplineMascot";
