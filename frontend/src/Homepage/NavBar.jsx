import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

function NavBar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    navigate("/auth?mode=login");
    setMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate("/auth?mode=signup");
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
        ? "bg-black/80 backdrop-blur-md border-b border-white/5 py-4"
        : "bg-transparent py-6"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 relative z-50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            R
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            ReachStakes
          </span>
        </div>

        {/* Desktop Menu */}
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

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLogin}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Login
          </button>
          <button
            onClick={handleGetStarted}
            className="bg-white text-black text-sm font-medium rounded-full px-5 py-2.5 hover:bg-white/90 transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white relative z-50 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-0 pt-24 bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center gap-8 md:hidden overflow-hidden"
          >
            {["Features", "How it Works", "Pricing", "About"].map((item) => (
              <a
                key={item}
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-medium text-white/80 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
            <div className="flex flex-col gap-4 mt-4 w-full px-10">
              <button
                onClick={handleLogin}
                className="w-full py-3 text-white/80 border border-white/20 rounded-full font-medium"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 bg-white text-black rounded-full font-bold"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default NavBar;