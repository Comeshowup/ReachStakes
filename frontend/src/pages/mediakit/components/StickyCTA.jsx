import React from "react";
import { Briefcase } from "lucide-react";

const StickyCTA = ({ onBook }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-50 sm:hidden">
      <button
        onClick={onBook}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-colors"
      >
        <Briefcase className="w-4 h-4" />
        Book Now
      </button>
    </div>
  );
};

export default StickyCTA;
