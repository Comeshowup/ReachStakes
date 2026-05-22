import React from "react";
import { Check, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

const ServicesSection = ({ services, onBook }) => {
  // Setup standard professional fallbacks if no services are defined yet
  const defaultServices = [
    {
      id: "default-1",
      title: "Video Integration (30-60s)",
      price: 25000,
      description: "A natural, high-retention mid-roll or pre-roll sponsor placement perfectly woven into new editorial content.",
      deliverables: [
        "30-60 second visual sponsor segment",
        "Primary brand link in pinned description",
        "Multi-platform callouts (social links)",
        "2 Rounds of review & script alignment"
      ],
      turnaroundTime: "7 Days"
    },
    {
      id: "default-2",
      title: "Full Dedicated Showcase",
      price: 65000,
      description: "An in-depth, exclusive review or tutorial fully focused on your product, showing value, use cases, and setup guides.",
      deliverables: [
        "8-12 minute high-end dedicated video",
        "Deep-dive product walkthrough & screen share",
        "SEO metadata optimization for search longevity",
        "Perpetual distribution rights on YouTube"
      ],
      turnaroundTime: "14 Days"
    },
    {
      id: "default-3",
      title: "Shorts / Reels Campaign",
      price: 15000,
      description: "High-energy vertical video cross-posted across Reels, Shorts, and TikTok to drive virality and quick brand discovery.",
      deliverables: [
        "1x Premium vertical short-form video",
        "Direct clickable bio links & active tags",
        "Engagement monitoring & feedback curation",
        "Access to organic campaign analytics"
      ],
      turnaroundTime: "5 Days"
    }
  ];

  // Only show enabled services
  const dbServices = services ? services.filter((s) => s.isEnabled !== false) : [];
  const displayServices = dbServices.length > 0 ? dbServices : defaultServices;

  const formatPrice = (price) => {
    if (!price || Number(price) === 0) return "Request Quote";
    const num = Number(price);
    return `₹${num.toLocaleString()}`;
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
          Collaboration Packages
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-white/5 border border-white/5 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ReachStakes Escrow Protection Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayServices.map((service, index) => {
          const isFeatured = index === 1; // Highlight the middle package (dedicated showcase)
          return (
            <div
              key={service.id || service.title}
              className={`relative p-6 sm:p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-6 group overflow-hidden ${
                isFeatured
                  ? "bg-slate-900/60 border-indigo-500/30 hover:border-indigo-500/50 shadow-2xl shadow-indigo-500/5"
                  : "bg-white/[0.01] hover:bg-white/[0.02] border-white/5 hover:border-white/10"
              }`}
            >
              {isFeatured && (
                <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-[10px] font-bold tracking-widest text-white uppercase shadow-md select-none">
                  Most Popular
                </div>
              )}

              {/* Package Meta Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {service.title}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                      {formatPrice(service.price)}
                    </span>
                    {service.price > 0 && (
                      <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        / Deliverable
                      </span>
                    )}
                  </div>
                </div>

                {service.description && (
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                    {service.description}
                  </p>
                )}

                {/* Deliverables checklist */}
                {service.deliverables ? (
                  <div className="space-y-2.5 pt-4 border-t border-white/5">
                    {service.deliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-indigo-400 stroke-[3]" />
                        </div>
                        <span className="text-xs text-slate-300 leading-relaxed font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : service.description && (
                  <div className="space-y-2.5 pt-4 border-t border-white/5">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-indigo-400 stroke-[3]" />
                      </div>
                      <span className="text-xs text-slate-300 leading-relaxed font-medium">
                        Standard high-retention video deliverable
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-indigo-400 stroke-[3]" />
                      </div>
                      <span className="text-xs text-slate-300 leading-relaxed font-medium">
                        Audience call to action and link tags
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <span>Turnaround</span>
                  <span className="text-slate-400 font-bold">{service.turnaroundTime || "7 Days"}</span>
                </div>

                <button
                  onClick={onBook}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isFeatured
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10"
                  }`}
                >
                  Book Package
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesSection;

