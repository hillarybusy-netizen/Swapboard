import { FAQ_ITEMS } from "@/lib/seo";

export function LandingFaq() {
  return (
    <section
      id="faq"
      className="py-32 px-6 bg-[#050505] border-t border-white/5"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto">
        <h2 id="faq-heading" className="text-3xl md:text-4xl font-black text-center mb-4 tracking-tight">
          Shift swapping platform <span className="text-gold-gradient">FAQ</span>
        </h2>
        <p className="text-center text-white/40 text-sm font-medium mb-12 max-w-lg mx-auto">
          Common questions about SwapBoard and shift swap software for operations teams.
        </p>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group glass rounded-2xl border-white/5 overflow-hidden"
            >
              <summary className="cursor-pointer list-none px-6 py-5 font-bold text-white/90 hover:text-white transition-colors flex items-center justify-between gap-4">
                {item.question}
                <span className="text-gold text-lg font-light shrink-0 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-5 text-sm text-white/50 leading-relaxed font-medium border-t border-white/5 pt-4">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
