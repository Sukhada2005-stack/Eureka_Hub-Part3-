import { motion } from "motion/react";
import { Starfield } from "./components/Starfield";
import { NebulaSifter } from "./components/NebulaSifter";
import { PhotonBounce } from "./components/PhotonBounce";
import { PressurePulse } from "./components/PressurePulse";
import { SolarSailPulse } from "./components/SolarSailPulse";
import { SignalDecrypter } from "./components/SignalDecrypter";

export default function App() {
  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden"
      style={{ backgroundColor: "var(--deep-space)" }}
    >
      <Starfield />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="font-serif tracking-widest mb-4"
            style={{
              fontSize: "3.5rem",
              color: "var(--parchment)",
              textShadow: "0 0 40px rgba(251, 191, 36, 0.5)",
            }}
            animate={{
              textShadow: [
                "0 0 40px rgba(251, 191, 36, 0.5)",
                "0 0 60px rgba(251, 191, 36, 0.7)",
                "0 0 40px rgba(251, 191, 36, 0.5)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            THE LAB
          </motion.h1>
          <p
            className="font-mono tracking-wider opacity-70"
            style={{
              color: "var(--copper)",
              fontSize: "1.125rem",
            }}
          >
            A Cosmic Forge Where Engineering Meets the Stars
          </p>
        </motion.header>

        <div className="space-y-8">
          {/* First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              className="backdrop-blur-sm border-2 p-8 rounded-lg"
              style={{
                backgroundColor: "rgba(26, 15, 46, 0.4)",
                borderColor: "rgba(168, 85, 247, 0.3)",
                boxShadow:
                  "inset 8px 0 16px rgba(168, 85, 247, 0.2)",
              }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <NebulaSifter />
            </motion.div>

            <motion.div
              className="backdrop-blur-sm border-2 p-8 rounded-lg"
              style={{
                backgroundColor: "rgba(26, 15, 46, 0.4)",
                borderColor: "rgba(59, 130, 246, 0.3)",
                boxShadow:
                  "inset 8px 0 16px rgba(59, 130, 246, 0.2)",
              }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <PhotonBounce />
            </motion.div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              className="backdrop-blur-sm border-2 p-8 rounded-lg"
              style={{
                backgroundColor: "rgba(26, 15, 46, 0.4)",
                borderColor: "rgba(251, 191, 36, 0.3)",
                boxShadow:
                  "inset 8px 0 16px rgba(251, 191, 36, 0.2)",
              }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <PressurePulse />
            </motion.div>

            <motion.div
              className="backdrop-blur-sm border-2 p-8 rounded-lg"
              style={{
                backgroundColor: "rgba(26, 15, 46, 0.4)",
                borderColor: "rgba(165, 28, 48, 0.3)",
                boxShadow:
                  "inset 8px 0 16px rgba(165, 28, 48, 0.2)",
              }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <SolarSailPulse />
            </motion.div>
          </div>

          {/* Third Row - Centered */}
          <div className="flex justify-center">
            <motion.div
              className="backdrop-blur-sm border-2 p-8 rounded-lg w-full lg:w-1/2"
              style={{
                backgroundColor: "rgba(26, 15, 46, 0.4)",
                borderColor: "rgba(59, 130, 246, 0.3)",
                boxShadow:
                  "inset 8px 0 16px rgba(59, 130, 246, 0.2)",
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <SignalDecrypter />
            </motion.div>
          </div>
        </div>

        <motion.footer
          className="mt-16 text-center font-mono opacity-50"
          style={{
            color: "var(--parchment)",
            fontSize: "0.875rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <p>
            Where Ancient Alchemy Meets Cosmic Discovery — Five
            Addictive Experiments
          </p>
        </motion.footer>
      </div>
    </div>
  );
}