// cdn — CDN indirection for heavy static assets (GLB models, Draco decoder,
// hero film, posters). Wrap any absolute /public path with cdn(...) so the same
// code can serve those bytes from an S3/CloudFront origin in production.
//
// Behavior is a no-op until NEXT_PUBLIC_CDN_URL is set: cdn() returns the local
// path UNCHANGED, so dev + current prod keep serving from /public with zero
// change. Point NEXT_PUBLIC_CDN_URL at the CDN base (e.g.
// https://cdn.cubixso.ai) and every wrapped asset transparently rehosts.
//
// Only rewrites absolute paths ("/models/x.glb"); anything else (already-
// absolute URLs, relative paths) is returned verbatim so we never double-prefix.
export const cdn = (path: string): string => {
  const base = process.env.NEXT_PUBLIC_CDN_URL;
  if (!base || !path.startsWith("/")) return path;
  return base.replace(/\/+$/, "") + path;
};
