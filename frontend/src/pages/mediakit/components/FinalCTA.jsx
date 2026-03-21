import React from "react";
import { Briefcase } from "lucide-react";

const FinalCTA = ({ onBook }) => {
  return (
    <section className="py-12 text-center space-y-5">
      <h2 className="text-2xl font-bold text-white">
        Ready to collaborate?
      </h2>
      <p className="text-base text-slate-400 max-w-md mx-auto">
        Let&apos;s create something amazing together. Secure your booking
        through ReachStakes.
      </p>
      <button
        onClick={onBook}
        className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <Briefcase className="w-4 h-4" />
        Book Creator
      </button>
      <p className="text-xs text-slate-600">
        Secure booking powered by ReachStakes Escrow
      </p>
    </section>
  );
};

export default FinalCTA;
