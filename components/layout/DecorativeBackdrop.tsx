/**
 * Quiet backdrop for auth & onboarding: a faint dot grid, one warm light
 * source from the top, and a vignette. Pointer-events none.
 */
export function DecorativeBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
      <div className="absolute inset-0 bg-mesh [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_30%,transparent_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(212,175,55,0.10),transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </div>
  );
}
