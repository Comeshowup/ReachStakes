import { Feature1, Feature2, Feature3, Feature4 } from "./FeatureCards";
import Header from "./Header";
import { motion } from "framer-motion";

function Features() {
  return (
    <>
      {/* Features Section */}
      <main>
        <div className="max-w-8xl mx-10 px-6 py-16 md:py-24">
          {/* Section header */}
          <div className="space-y-16 mx-20">
        
            <Feature3 />
            <Feature4 />
            <Header />
          </div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-px "
          ></motion.div>

          {/* CTA */}
          <section className="text-center ">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl md:text-5xl tracking-tight font-light mb-8"
            >
              Ready to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                experience
              </span>{" "}
              ReachStakes?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-white/60 font-light max-w-2xl mx-auto mb-10 text-lg"
            >
              Join thousands of teams already using our platform to accelerate
              their workflow.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-5 justify-center"
            >
              <button className="bg-white text-black/90 font-medium rounded-full px-8 py-4 hover:bg-white/90 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Sign Up
              </button>
              <button className="bg-white/5 border border-white/15 rounded-full px-8 py-4 hover:bg-white/10 hover:border-white/25 transition-all text-white">
                Login
              </button>
            </motion.div>
          </section>
        </div>
      </main>
    </>
  );
}
export default Features;
