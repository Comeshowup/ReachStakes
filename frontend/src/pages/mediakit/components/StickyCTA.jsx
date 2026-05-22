import React from "react";
import { Briefcase } from "lucide-react";

const StickyCTA = ({ onBook }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-50 sm:hidden">
      <button
        onClick={onBook}
        className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-indigo-600/35 transition-all duration-300 transform active:scale-95"
      >
        <Briefcase className="w-4 h-4" />
        Book Creator Now
      </button>
    </div>
  );
};

export default StickyCTA;

