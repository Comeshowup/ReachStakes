import {
  Zap,
  ShieldCheck,
  Activity,
  Lock,
  Users,
  MessageSquare,
  Cloud,
  BarChart,
  LineChart,
  Workflow,
  Bot,
  Clock,
  Sliders,
  Settings,
  Filter,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Feature1() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {/* 1/3 */}
      <motion.div variants={cardVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 hover:border-white/20 transition-colors group">
        <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Zap className="w-5 h-5 text-indigo-300" />
        </div>
        <h3 className="text-xl tracking-tight font-normal mb-2 text-white">
          Instant Connections
        </h3>
        <p className="text-white/60 font-light leading-relaxed">
          Seamless experience from pitching to payment. Find opportunities and
          complete transactions instantly
        </p>
        <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
          <Activity className="w-4 h-4" />
          <span>Real-time Campaign Updates</span>
        </div>
      </motion.div>

      {/* 2/3 */}
      <motion.div variants={cardVariants} className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 hover:border-white/20 transition-colors group">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="md:w-1/2">
            <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 text-purple-300" />
            </div>
            <h3 className="text-xl tracking-tight font-normal mb-2 text-white">
              Financial Trust & Security
            </h3>
            <p className="text-white/60 font-light leading-relaxed">
              Secure payments and protected intellectual property. Your assets
              and earnings are safeguarded.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/50">Escrow Protection</div>
                <div className="text-white/80 mt-1">Mandatory</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/50">IP Rights</div>
                <div className="text-white/80 mt-1">Secured Contracts</div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl rounded-2xl bg-purple-500/10"></div>
              <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-sm text-white/70">Cert status</span>
                  </div>
                  <span className="text-xs text-white/50">Auto‑renew</span>
                </div>
                <div className="mt-4 h-28 rounded-md border border-white/10 bg-white/5 grid place-items-center">
                  <Lock className="w-8 h-8 text-purple-300" />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                  <span>Rotation interval</span>
                  <span>24h</span>
                </div>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-purple-400/70 to-indigo-400/70"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Feature2() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {/* 2/3 */}
      <motion.div variants={cardVariants} className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 hover:border-white/20 transition-colors group">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="md:w-1/2">
            <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 text-blue-300" />
            </div>
            <h3 className="text-xl tracking-tight font-normal mb-2 text-white">
              Project Hub
            </h3>
            <p className="text-white/60 font-light leading-relaxed">
              Manage campaign briefs, share feedback, and approve
              deliverables—all in one place.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
              <MessageSquare className="w-4 h-4" />
              <span>Integrated Chat & Review Tools</span>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-white/20 transition-colors">
                <div className="flex items-center">
                  <img
                    className="w-8 h-8 rounded-full object-cover mr-3 ring-1 ring-white/10"
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&amp;w=100&amp;auto=format&amp;fit=crop"
                    alt="Avatar A"
                  />
                  <div className="text-sm text-white/70">
                    Brand X approved the pitch
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-white/20 transition-colors">
                <div className="flex items-center">
                  <img
                    className="w-8 h-8 rounded-full object-cover mr-3 ring-1 ring-white/10"
                    src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&amp;q=80"
                    alt="Avatar B"
                  />
                  <div className="text-sm text-white/70">
                    Editor Y delivered the final cut
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-white/20 transition-colors">
                <div className="flex items-center">
                  <img
                    className="w-8 h-8 rounded-full object-cover mr-3 ring-1 ring-white/10"
                    src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&amp;w=100&amp;auto=format&amp;fit=crop"
                    alt="Avatar C"
                  />
                  <div className="text-sm text-white/70">
                    Creator Z requested a revision.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 1/3 */}
      <motion.div variants={cardVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 hover:border-white/20 transition-colors group">
        <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Cloud className="w-5 h-5 text-cyan-300" />
        </div>
        <h3 className="text-xl tracking-tight font-normal mb-2 text-white">
          Secure Asset Transfer
        </h3>
        <p className="text-white/60 font-light leading-relaxed">
          Safely share and store large video files and brand assets with
          industry-standard cloud providers.
        </p>
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-white/70">PayPal</span>
            <span className="text-emerald-300">Connected</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-white/70">Payout</span>
            <span className="text-white/50">Pending</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Feature3() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {/* 1/3 */}
      <motion.div variants={cardVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 hover:border-white/20 transition-colors group">
        <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <BarChart className="w-5 h-5 text-emerald-300" />
        </div>
        <h3 className="text-xl tracking-tight font-normal mb-2 text-white">
          Data-Driven Success
        </h3>
        <p className="text-white/60 font-light leading-relaxed">
          Track campaign performance, audience demographics, and projected ROI
          with powerful, exportable reports.
        </p>
        <div className="mt-6">
          <div className="h-24 rounded-md border border-white/10 bg-white/5 grid place-items-center">
            <LineChart className="w-8 h-8 text-emerald-300" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/60">
            <span>Engagement Rate</span>
            <span>+18%</span>
          </div>
          <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-emerald-400/70 to-teal-400/70"></div>
          </div>
        </div>
      </motion.div>

      {/* 2/3 */}
      <motion.div variants={cardVariants} className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 hover:border-white/20 transition-colors group">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="md:w-1/2">
            <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Workflow className="w-5 h-5 text-fuchsia-300" />
            </div>
            <h3 className="text-xl tracking-tight font-normal mb-2 text-white">
              Automated Matching
            </h3>
            <p className="text-white/60 font-light leading-relaxed">
              Let our system handle the logistics, from contract generation to
              milestone payment release.
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400"></span>
                <div className="h-1 flex-1 bg-white/10 rounded">
                  <div className="h-1 w-3/5 rounded bg-fuchsia-300/80"></div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <div className="h-1 flex-1 bg-white/10 rounded">
                  <div className="h-1 w-2/5 rounded bg-purple-300/80"></div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                <div className="h-1 flex-1 bg-white/10 rounded">
                  <div className="h-1 w-4/5 rounded bg-indigo-300/80"></div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl rounded-2xl bg-fuchsia-500/10"></div>
              <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-fuchsia-300" />
                    <span className="text-sm text-white/70">
                      Process Status
                    </span>
                  </div>
                  <span className="text-xs text-white/50">Active</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-sm text-white/70">
                      Contract {"\u2192"} Auto-Generate
                    </span>
                    <span className="text-emerald-300 text-xs">Success</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-sm text-white/70">
                      {" "}
                      Payment {"\u2192"} Escrow Hold
                    </span>
                    <span className="text-white/60 text-xs">Queued</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-sm text-white/70">
                      Creator {"\u2192"} Match Brand{" "}
                    </span>
                    <span className="text-white/60 text-xs">Rules</span>
                  </div>
                </div>
                <div className="mt-4 h-px bg-white/10"></div>
                <div className="mt-4 flex items-center gap-3 text-xs text-white/60">
                  <Clock className="w-4 h-4" />
                  <span>Last run 2m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Feature4() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {/* 2/3 */}
      <motion.div variants={cardVariants} className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 hover:border-white/20 transition-colors group">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="md:w-1/2">
            <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sliders className="w-5 h-5 text-rose-300" />
            </div>
            <h3 className="text-xl tracking-tight font-normal mb-2 text-white">
              Flexible Campaign Setup
            </h3>
            <p className="text-white/60 font-light leading-relaxed">
              Tailor your campaign briefs, set budgets, and define
              deliverables with maximum flexibility.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-xs text-white/50">Performance</div>
                <div className="text-white/80 text-lg mt-0.5">98%</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-xs text-white/50">Uptime</div>
                <div className="text-white/80 text-lg mt-0.5">99.9%</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-xs text-white/50">Active Users</div>
                <div className="text-white/80 text-lg mt-0.5">1.2M</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-xs text-white/50">Presets</div>
                <div className="text-white/80 text-lg mt-0.5">23</div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-rose-300" />
                  <span className="text-sm text-white/70">Presets</span>
                </div>
                <span className="text-xs text-white/50">3 profiles</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button className="text-xs rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:border-white/20 hover:bg-white/10 transition-colors">
                  Product Review
                </button>
                <button className="text-xs rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:border-white/20 hover:bg-white/10 transition-colors">
                  Tutorial
                </button>
                <button className="text-xs rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:border-white/20 hover:bg-white/10 transition-colors">
                  Lookbook
                </button>
              </div>
              <div className="mt-4 h-px bg-white/10"></div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Matching</span>
                  <span className="text-white/60">Refined</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Revisions</span>
                  <span className="text-white/60">3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Tracking</span>
                  <span className="text-emerald-300">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 1/3 */}
      <motion.div variants={cardVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 hover:border-white/20 transition-colors group">
        <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Filter className="w-5 h-5 text-amber-300" />
        </div>
        <h3 className="text-xl tracking-tight font-normal mb-2 text-white">
          AI-Powered Discovery
        </h3>
        <p className="text-white/60 font-light leading-relaxed">
          Instantly match with the ideal Creator, Brand, or Editor based on
          niche, audience data, and past success
        </p>
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2">
            <Search className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/60">
              Search by Niche, Platform, or Rate...
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Recent:</span>
            <span className="text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10 text-white/70">
              Tech Niche
            </span>
            <span className="text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10 text-white/70">
              Youtube
            </span>
            <span className="text-xs rounded-full px-2 py-1 bg-white/5 border border-white/10 text-white/70">
              Big Budget
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
