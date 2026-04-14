import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export function SignalDecrypter() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [activeKey, setActiveKey] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  const playTone = (frequency: number, duration: number = 200) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration / 1000);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration / 1000);
  };

  const startGame = () => {
    const newSequence = [Math.floor(Math.random() * 2)];
    setSequence(newSequence);
    setPlayerSequence([]);
    setLevel(1);
    setGameOver(false);
    setMessage("");
    playSequence(newSequence);
  };

  const playSequence = async (seq: number[]) => {
    setPlaying(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setActiveKey(seq[i]);
      playTone(seq[i] === 0 ? 400 : 600, 300);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setActiveKey(null);
    }
    setPlaying(false);
  };

  const handleKeyPress = (key: number) => {
    if (playing || gameOver) return;

    setActiveKey(key);
    playTone(key === 0 ? 400 : 600, 200);
    setTimeout(() => setActiveKey(null), 200);

    const newPlayerSequence = [...playerSequence, key];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;

    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      setGameOver(true);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const words = ["SIGNAL", "DECODED", "PULSAR", "BINARY", "COSMIC", "PHOTON", "QUANTUM"];
      const newWord = words[Math.min(level - 1, words.length - 1)];
      setMessage((prev) => prev + newWord + " ");

      setTimeout(() => {
        const nextSequence = [...sequence, Math.floor(Math.random() * 2)];
        setSequence(nextSequence);
        setPlayerSequence([]);
        setLevel((prev) => prev + 1);
        playSequence(nextSequence);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif tracking-wider" style={{ color: "var(--parchment)", fontSize: "2rem" }}>
          The Signal Decrypter
        </h2>
        <div className="font-mono" style={{ color: "var(--electric-blue)" }}>
          Level: {level}
        </div>
      </div>

      <p className="font-mono opacity-70" style={{ color: "var(--copper)", fontSize: "0.95rem" }}>
        A distant pulsar flashes a binary sequence. Repeat the pattern using the telegraph keys to decrypt the cosmic message.
      </p>

      <div
        className="relative rounded-lg overflow-hidden border-2"
        style={{
          height: "400px",
          backgroundColor: "rgba(10, 1, 24, 0.95)",
          borderColor: "var(--electric-blue)",
          boxShadow: activeKey !== null ? "0 0 60px rgba(59, 130, 246, 0.8)" : "0 0 40px rgba(59, 130, 246, 0.3)",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8">
          <AnimatePresence>
            {activeKey !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="absolute top-8 w-32 h-32 rounded-full"
                style={{
                  backgroundColor: "var(--electric-blue)",
                  boxShadow: "0 0 80px rgba(59, 130, 246, 0.9)",
                }}
              />
            )}
          </AnimatePresence>

          <div
            className="min-h-[100px] w-full px-8 flex items-center justify-center overflow-hidden"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--electric-blue)",
              fontSize: "1.2rem",
              textShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
            }}
          >
            <div className="text-center break-words max-w-full">
              {message || "Awaiting Signal..."}
            </div>
          </div>

          <div className="flex gap-8 z-10">
            <motion.button
              onClick={() => handleKeyPress(0)}
              disabled={playing || gameOver || sequence.length === 0}
              className="relative rounded-lg font-mono disabled:opacity-50"
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: activeKey === 0 ? "var(--electric-blue)" : "#1a0f2e",
                border: "3px solid var(--electric-blue)",
                color: activeKey === 0 ? "#000" : "var(--electric-blue)",
                boxShadow: activeKey === 0 ? "0 0 40px var(--electric-blue)" : "0 0 10px rgba(59, 130, 246, 0.3)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-4xl">0</div>
              <div className="text-sm mt-2">DOT</div>
            </motion.button>

            <motion.button
              onClick={() => handleKeyPress(1)}
              disabled={playing || gameOver || sequence.length === 0}
              className="relative rounded-lg font-mono disabled:opacity-50"
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: activeKey === 1 ? "var(--electric-blue)" : "#1a0f2e",
                border: "3px solid var(--electric-blue)",
                color: activeKey === 1 ? "#000" : "var(--electric-blue)",
                boxShadow: activeKey === 1 ? "0 0 40px var(--electric-blue)" : "0 0 10px rgba(59, 130, 246, 0.3)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-4xl">1</div>
              <div className="text-sm mt-2">DASH</div>
            </motion.button>
          </div>
        </div>

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/60">
            <div className="text-center space-y-4">
              <h3 className="font-serif" style={{ color: "var(--electric-blue)", fontSize: "1.8rem" }}>
                Signal Lost!
              </h3>
              <p className="font-mono" style={{ color: "var(--parchment)" }}>
                Decoded {level - 1} sequences
              </p>
              <p className="font-mono text-sm px-4" style={{ color: "var(--electric-blue)" }}>
                {message}
              </p>
              <button
                onClick={startGame}
                className="px-6 py-2 rounded-lg font-mono"
                style={{
                  backgroundColor: "var(--electric-blue)",
                  color: "#fff",
                }}
              >
                Restart
              </button>
            </div>
          </div>
        )}

        {sequence.length === 0 && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startGame}
              className="px-8 py-4 rounded-lg font-mono text-lg"
              style={{
                backgroundColor: "var(--electric-blue)",
                color: "#fff",
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
              }}
            >
              Receive Signal
            </button>
          </div>
        )}
      </div>

      {sequence.length > 0 && !gameOver && (
        <div className="text-center">
          <p className="font-mono opacity-70" style={{ color: "var(--copper)", fontSize: "0.9rem" }}>
            {playing ? "Receiving transmission..." : "Repeat the sequence"}
          </p>
        </div>
      )}
    </div>
  );
}
