import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-black/50 backdrop-blur-md border-b border-white/5 py-4"
          : "bg-transparent py-6"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            R
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            ReachStakes
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:block text-sm text-white/70 hover:text-white transition-colors">
            Login
          </button>
          <button className="bg-white text-black text-sm font-medium rounded-full px-5 py-2.5 hover:bg-white/90 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

export default NavBar;