// ReachStakesFooterAnimated.jsx
// Vibrant, aesthetic, animation-packed footer component for ReachStakes
// TailwindCSS + Framer Motion (drop into React project). Uses no external icon libs.

import React from "react";
import { motion } from "framer-motion";

export default function ReachStakesFooterAnimated() {
  return (
    <footer className="relative text-gray-100 overflow-hidden">



      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

          {/* Brand + Animated Logo */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: [0, 8, -6, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M3 12c0 4.418 3.582 8 8 8s8-3.582 8-8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
                  <circle cx="11" cy="8" r="2.2" fill="white" opacity="0.95" />
                </svg>
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">ReachStakes</h2>
                <p className="text-xs text-gray-300">Creators × Brands — campaigns that resonate.</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 max-w-[36ch]">Discover curated campaigns, track performance, and get paid reliably. Built for creators who care about craft and brands that care about impact.</p>

            {/* Quick social icons with animated hover */}
            <div className="flex gap-3 mt-2">
              <SocialIcon ariaLabel="Instagram" svgPath={<path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.5A4.5 4.5 0 107 13a4.5 4.5 0 005-4.5zM18.5 6a1 1 0 11-2 0 1 1 0 012 0z" />} />
              <SocialIcon ariaLabel="LinkedIn" svgPath={<path d="M4.98 3.5C4.98 5 3.7 6.2 2 6.2S-.98 5 .02 3.5 1.3.8 3 0c1.7.8 1.98 2.5 1.98 3.5zM.5 8h4.9v14H.5V8zM9 8h4.7v2h.1c.7-1.2 2.4-2.4 4.9-2.4 5.3 0 6.2 3.5 6.2 8.1V22H20v-6.5c0-1.6 0-3.7-2.3-3.7-2.4 0-2.8 1.9-2.8 3.6V22H9V8z" />} />
              <SocialIcon ariaLabel="Twitter" svgPath={<path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 7v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />} />
            </div>

          </motion.div>

          {/* Animated Feature Cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard title="Campaign Discovery" desc="Smart filters + AI suggestions to match your style with paying campaigns." icon="rocket" delay={0} />
            <FeatureCard title="Creator Analytics" desc="At-a-glance metrics and clean exportable reports for brands and creators." icon="chart" delay={100} />
            <FeatureCard title="Instant Payouts" desc="Fast, transparent payouts with earnings breakdown and tax docs." icon="wallet" delay={200} />
            <FeatureCard title="Collab Tools" desc="Streamlined briefs, asset uploads, and approval flows that actually work." icon="chat" delay={300} />
          </div>

        </div>

        {/* CTA / Newsletter with motion */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-10 bg-gradient-to-r from-white/3 to-transparent border border-white/6 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1">
            <h4 className="text-white font-semibold">Join 25k+ creators</h4>
            <p className="text-sm text-gray-300">Get early access to exclusive brand campaigns and tips — delivered monthly.</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex w-full sm:w-auto gap-2 items-center">
            <label htmlFor="email" className="sr-only">Email</label>
            <motion.input whileFocus={{ scale: 1.02 }} id="email" placeholder="you@awesome.com" type="email" required className="px-3 py-2 rounded-md bg-transparent border border-white/8 placeholder-gray-300 text-white focus:outline-none" />
            <motion.button whileTap={{ scale: 0.98 }} className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-br from-indigo-500 to-pink-500 text-white font-medium shadow-md">Subscribe</motion.button>
          </form>
        </motion.div>

        {/* bottom legal */}
        <div className="mt-8 border-t border-white/6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-300">
          <p>© {new Date().getFullYear()} ReachStakes Pvt. Ltd. — Crafted with creators in mind.</p>
          <div className="flex gap-4 items-center">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="mailto:support@reachstakes.com" className="hover:underline">support@reachstakes.com</a>
          </div>
        </div>

      </div>

      {/* extra small animated styles */}
      <style>{`
        /* blob animation */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(20px, -10px) scale(1.05); }
          66% { transform: translate(-10px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>

    </footer>
  );
}


/* ----------------- Helper components ----------------- */
function SocialIcon({ ariaLabel, svgPath }) {
  return (
    <motion.a whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }} href="#" aria-label={ariaLabel} className="p-2 rounded-md bg-white/3 hover:bg-white/6 transition-shadow shadow-sm">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        {svgPath}
      </svg>
    </motion.a>
  );
}

function FeatureCard({ title, desc, icon, delay = 0 }) {
  const icons = {
    rocket: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 22s1-4 4-6l7-7 3 3-7 7c-2 3-6 4-6 4z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>),
    chart: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v18h18" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 13V7M12 17V5M16 11v-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>),
    wallet: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="12" rx="2" stroke="white" strokeWidth="1.2" /><circle cx="18" cy="13" r="1" fill="white" /></svg>),
    chat: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>)
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: delay / 1000 }} className="p-4 rounded-2xl bg-gradient-to-br from-white/3 to-transparent border border-white/6 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-md">
          {icons[icon]}
        </div>
        <div>
          <h5 className="font-semibold text-white">{title}</h5>
          <p className="text-sm text-gray-300">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

/*
USAGE NOTES:
- Save as `ReachStakesFooterAnimated.jsx` inside your components folder.
- Requires: TailwindCSS + Framer Motion (install: `npm i framer-motion`).
- Replace href="#" with your real links or Next.js <Link> components.
- Newsletter form is client-side currently; hook it up to your API or mailing provider.
- Tweak colors in Tailwind config for brand consistency.
*/
