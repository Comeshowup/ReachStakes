// HowReachStakesWorks.jsx
import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    id: "01",
    label: "Connect & Define",
    description:
      "Link your social channels, set your niches, content formats, and base rates. We auto-build a campaign-ready creator profile for you.",
  },
  {
    id: "02",
    label: "Match & Contract",
    description:
      "Our engine matches you with campaigns that fit your audience and style. Review briefs, negotiate terms, and sign smart contracts in a few clicks.",
  },
  {
    id: "03",
    label: "Collaborate & Payout",
    description:
      "Deliver content, submit for approval, and track status in one place. Once the brand signs off, payouts are released to your account automatically.",
  },
];

const highlights = [
  {
    icon: "⏱️",
    title: "Real-Time ROI",
    description:
      "See how each post performs the moment it goes live with live metrics and breakdowns.",
  },
  {
    icon: "👥",
    title: "Audience Insights",
    description:
      "Understand who you’re truly reaching so brands can confidently invest more in you.",
  },
  {
    icon: "✨",
    title: "Match Quality Score",
    description:
      "A proprietary score showing how well a brand’s brief matches your audience profile.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const HowReachStakesWorks = () => {
  return (
    <section className="relative w-full py-20 md:py-24">
      {/* subtle gradient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500/10 via-violet-500/10 to-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.25em] text-neutral-400"
          >
            Workflow
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3 text-3xl md:text-4xl font-semibold text-white"
          >
            How{" "}
            <span className="bg-gradient-to-r from-sky-400 to-violet-500 bg-clip-text text-transparent">
              ReachStakes
            </span>{" "}
            works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-neutral-400"
          >
            A simple three-step pipeline that takes you from signing up to
            getting paid for brand collaborations—without messy emails or
            spreadsheets.
          </motion.p>
        </div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/60 px-6 py-7 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-violet-500/60 hover:shadow-[0_0_40px_rgba(139,92,246,0.55)]"
            >
              {/* gradient border glow */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-sky-500/15 via-transparent to-violet-500/25" />
              </div>

              {/* content layer */}
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-neutral-300">
                    {index + 1}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {step.label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                  {step.description}
                </p>

                {/* subtle underline accent */}
                <div className="mt-5 h-px w-16 bg-gradient-to-r from-sky-400/80 to-violet-500/80 opacity-60 group-hover:opacity-100 group-hover:w-24 transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom mini–features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-14 grid gap-8 md:grid-cols-3"
        >
          {highlights.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-xl">
                <span aria-hidden="true">{item.icon}</span>
              </div>
              <h4 className="text-sm font-medium text-white">
                {item.title}
              </h4>
              <p className="mt-2 text-xs md:text-sm text-neutral-400 max-w-xs">
                {item.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowReachStakesWorks;
