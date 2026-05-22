import React from "react";
import { Briefcase, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

const FinalCTA = ({ onBook }) => {
  const benefits = [
    "Secure Escrow Hold: Funds are held safely by ReachStakes until you approve the deliverables.",
    "Verified Campaign Analytics: Automated verification of all connected social metrics.",
    "Transparent Pricing & Revisions: Fixed contract pricing with dedicated dispute mediation."
  ];

  return (
    <section className="relative w-full rounded-3xl border border-indigo-500/20 bg-slate-900/40 backdrop-blur-md overflow-hidden p-8 sm:p-12 text-center space-y-8 shadow-2xl">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* Top Lock Badge */}
      <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
        <Lock className="w-5 h-5 stroke-[2.5]" />
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ready to scale your next campaign?
        </h2>
        <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
          Book this creator safely with ReachStakes Escrow Protection. Payments are released only after campaign deliverables are validated and completed.
        </p>
      </div>

      {/* Security Benefit Badges */}
      <div className="max-w-lg mx-auto text-left space-y-3.5 pt-4 pb-2 border-y border-white/5">
        {benefits.map((benefit, i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-0.5 shrink-0 text-emerald-400">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {benefit}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <button
          onClick={onBook}
          className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-300 transform hover:scale-[1.01]"
        >
          <Briefcase className="w-4 h-4" />
          Book Creator Now
        </button>
        
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-600" />
          Secure Payment Escrow holds by ReachStakes
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;

