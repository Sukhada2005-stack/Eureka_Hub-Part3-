import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export function PressurePulse() {
  const [pressure, setPressure] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cracked, setCracked] = useState(false);
  const [ventEffect, setVentEffect] = useState(false);
  const [successVents, setSuccessVents] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const pressureInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    pressureInterval.current = setInterval(() => {
      setPressure((prev) => {
        const newPressure = prev + (2 + altitude / 50);
        if (newPressure > 100) {
          setCracked(true);
          setGameOver(true);
          playBreakSound();
          return 100;
        }
        return newPressure;
      });
    }, 100);

    return () => {
      if (pressureInterval.current) {
        clearInterval(pressureInterval.current);
      }
    };
  }, [gameActive, gameOver, altitude]);

  const playHissSound = () => {
    if (!audioContext.current) return;

    const bufferSize = audioContext.current.sampleRate * 0.3;
    const buffer = audioContext.current.createBuffer(1, bufferSize, audioContext.current.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 3));
    }

    const noise = audioContext.current.createBufferSource();
    const gainNode = audioContext.current.createGain();
    const filter = audioContext.current.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 2000;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    gainNode.gain.setValueAtTime(0.2, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.3);

    noise.start(audioContext.current.currentTime);
    noise.stop(audioContext.current.currentTime + 0.3);
  };

  const playBreakSound = () => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.current.currentTime + 0.5);
    oscillator.type = "sawtooth";

    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.5);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + 0.5);
  };

  const vent = () => {
    if (!gameActive || gameOver) return;

    const inGreenZone = pressure >= 70 && pressure <= 85;

    if (inGreenZone) {
      // Success!
      setSuccessVents((prev) => prev + 1);
      setAltitude((prev) => prev + 50);
      setPressure(0);
      setVentEffect(true);
      playHissSound();
      setTimeout(() => setVentEffect(false), 500);
    } else if (pressure < 70) {
      // Vented too early - lose power
      setAltitude((prev) => Math.max(0, prev - 20));
      setPressure(0);
    } else {
      // Too late - gauge cracks
      setCracked(true);
      setGameOver(true);
      playBreakSound();
    }
  };

  const startGame = () => {
    setPressure(0);
    setAltitude(0);
    setGameActive(true);
    setGameOver(false);
    setCracked(false);
    setSuccessVents(0);
  };

  const restartGame = () => {
    setGameActive(false);
    setGameOver(false);
    setTimeout(startGame, 100);
  };

  const needleRotation = (pressure / 100) * 180 - 90;
  const backgroundColor = `hsl(${Math.max(30 - altitude / 10, 0)}, 40%, ${Math.max(20 - altitude / 30, 5)}%)`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif tracking-wider" style={{ color: "var(--parchment)", fontSize: "2rem" }}>
          The Pressure Pulse
        </h2>
        <div className="font-mono" style={{ color: "var(--amber)" }}>
          Altitude: {Math.floor(altitude)}m
        </div>
      </div>

      <p className="font-mono opacity-70" style={{ color: "var(--copper)", fontSize: "0.95rem" }}>
        Launch the steam probe by venting at the perfect moment. Hit the green zone (70-85) to ascend safely!
      </p>

      <div
        className="relative rounded-lg overflow-hidden border-2 transition-all duration-1000"
        style={{
          height: "400px",
          backgroundColor: gameActive ? backgroundColor : "rgba(10, 1, 24, 0.9)",
          borderColor: "var(--amber)",
          boxShadow: ventEffect
            ? "0 0 60px rgba(251, 191, 36, 0.9)"
            : "0 0 40px rgba(251, 191, 36, 0.3)",
        }}
      >
        {gameActive && (
          <>
            {/* Steam effect */}
            <AnimatePresence>
              {ventEffect && (
                <>
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0.8, x: 250, y: 350 }}
                      animate={{
                        scale: [0, 1.5, 2],
                        opacity: [0.8, 0.4, 0],
                        x: 250 + (Math.random() - 0.5) * 100,
                        y: 350 - 150,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="absolute rounded-full"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                        filter: "blur(8px)",
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Pressure Gauge */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="relative rounded-full"
                style={{
                  width: "250px",
                  height: "250px",
                  background: "radial-gradient(circle, rgba(184, 115, 51, 0.3), rgba(10, 1, 24, 0.8))",
                  border: "8px solid var(--copper)",
                  boxShadow: "inset 0 0 30px rgba(251, 191, 36, 0.3), 0 0 40px rgba(184, 115, 51, 0.4)",
                }}
                animate={{
                  boxShadow: cracked
                    ? "inset 0 0 30px rgba(212, 24, 61, 0.5), 0 0 40px rgba(212, 24, 61, 0.4)"
                    : "inset 0 0 30px rgba(251, 191, 36, 0.3), 0 0 40px rgba(184, 115, 51, 0.4)",
                }}
              >
                {/* Gauge markings */}
                {[...Array(11)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: "2px",
                      height: "15px",
                      backgroundColor:
                        i >= 7 && i <= 8.5 ? "var(--nebula-teal)" : "var(--copper)",
                      transformOrigin: "center -100px",
                      transform: `rotate(${-90 + i * 18}deg)`,
                    }}
                  />
                ))}

                {/* Green Zone Arc */}
                <svg
                  className="absolute inset-0"
                  style={{ transform: "rotate(-90deg)" }}
                  viewBox="0 0 250 250"
                >
                  <path
                    d="M 125 125 L 125 15 A 110 110 0 0 1 179 29"
                    fill="none"
                    stroke="var(--nebula-teal)"
                    strokeWidth="30"
                    opacity="0.3"
                  />
                </svg>

                {/* Needle */}
                <motion.div
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: "4px",
                    height: "90px",
                    backgroundColor: "var(--molten-red)",
                    transformOrigin: "center bottom",
                    boxShadow: "0 0 10px var(--molten-red)",
                  }}
                  animate={{ rotate: needleRotation }}
                  transition={{ duration: 0.1 }}
                />

                {/* Center rivet */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: "var(--copper)",
                    boxShadow: "0 0 10px rgba(184, 115, 51, 0.8)",
                  }}
                />

                {/* Crack effect */}
                {cracked && (
                  <motion.svg
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <path
                      d="M 125 50 L 140 80 L 130 120 L 145 160 L 135 200"
                      stroke="var(--destructive)"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.8"
                    />
                    <path
                      d="M 125 50 L 100 90 L 110 140 L 90 180"
                      stroke="var(--destructive)"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.8"
                    />
                  </motion.svg>
                )}
              </motion.div>

              {/* Pressure reading */}
              <div
                className="text-center mt-4 font-mono"
                style={{
                  color: pressure >= 70 && pressure <= 85 ? "var(--nebula-teal)" : "var(--amber)",
                  fontSize: "1.5rem",
                }}
              >
                {Math.floor(pressure)} PSI
              </div>
            </div>

            {/* Stars in background (appear as altitude increases) */}
            {altitude > 100 &&
              [...Array(Math.min(Math.floor(altitude / 50), 20))].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.3, 0.8, 0.3], scale: 1 }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  style={{
                    width: "3px",
                    height: "3px",
                    backgroundColor: "var(--parchment)",
                    left: `${20 + (i * 37) % 80}%`,
                    top: `${10 + (i * 43) % 60}%`,
                  }}
                />
              ))}
          </>
        )}

        {!gameActive && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startGame}
              className="px-8 py-4 rounded-lg font-mono text-lg"
              style={{
                backgroundColor: "var(--amber)",
                color: "var(--deep-space)",
                boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
              }}
            >
              Ignite Boiler
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50">
            <div className="text-center space-y-4">
              <h3 className="font-serif" style={{ color: "var(--molten-red)", fontSize: "1.8rem" }}>
                {cracked ? "Gauge Cracked!" : "Mission Failed"}
              </h3>
              <p className="font-mono" style={{ color: "var(--parchment)" }}>
                Maximum Altitude: {Math.floor(altitude)}m
              </p>
              <p className="font-mono text-sm" style={{ color: "var(--amber)" }}>
                Successful Vents: {successVents}
              </p>
              <button
                onClick={restartGame}
                className="px-6 py-2 rounded-lg font-mono"
                style={{
                  backgroundColor: "var(--amber)",
                  color: "var(--deep-space)",
                }}
              >
                Restart
              </button>
            </div>
          </div>
        )}
      </div>

      {gameActive && !gameOver && (
        <div className="flex justify-center">
          <button
            onClick={vent}
            className="px-8 py-3 rounded-lg font-mono transition-all text-lg"
            style={{
              backgroundColor:
                pressure >= 70 && pressure <= 85 ? "var(--nebula-teal)" : "var(--amber)",
              color: "#fff",
              boxShadow:
                pressure >= 70 && pressure <= 85
                  ? "0 0 30px rgba(13, 148, 136, 0.8)"
                  : "0 0 20px rgba(251, 191, 36, 0.5)",
            }}
          >
            VENT STEAM
          </button>
        </div>
      )}
    </div>
  );
}
