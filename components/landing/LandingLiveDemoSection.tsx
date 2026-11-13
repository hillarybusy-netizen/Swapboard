import { LandingHeroPreview } from "@/components/landing/LandingHeroPreview";
import { FadeUpOnScroll } from "@/components/animations/ScrollAnimations";

export function LandingLiveDemoSection() {
  return (
    <section id="live-demo" className="scroll-mt-24 px-4 sm:px-6 pb-20 sm:pb-28 bg-[#050505]">
      <div className="max-w-5xl mx-auto">
        <FadeUpOnScroll>
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-sm font-medium text-gold mb-3">Live demo</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
              Try the worker app right here
            </h2>
            <p className="text-base sm:text-lg text-white/55 max-w-xl mx-auto">
              This is what your staff see. Click through the tabs to post a shift, browse open shifts and check the swap board.
            </p>
          </div>
        </FadeUpOnScroll>
        <LandingHeroPreview />
      </div>
    </section>
  );
}
