import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Asteroid {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function SolarSailPulse() {
  const [sailY, setSailY] = useState(200);
  const [velocity, setVelocity] = useState(0);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const nextAsteroidId = useRef(0);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const gameLoop = setInterval(() => {
      setSailY((prevY) => {
        const newY = prevY + velocity;
        if (newY < 0 || newY > 350) {
          setGameOver(true);
          return prevY;
        }
        return newY;
      });

      setVelocity((prev) => Math.min(prev + 0.3, 5));

      setAsteroids((prev) => {
        const updated = prev
          .map((asteroid) => ({ ...asteroid, x: asteroid.x - 3 }))
          .filter((asteroid) => asteroid.x > -50);

        const sailHit = updated.some(
          (asteroid) =>
            asteroid.x < 100 &&
            asteroid.x > 20 &&
            Math.abs(asteroid.y - sailY) < asteroid.size / 2 + 30
        );

        if (sailHit) {
          setGameOver(true);
        }

        return updated;
      });

      if (Math.random() < 0.02) {
        setAsteroids((prev) => [
          ...prev,
          {
            id: nextAsteroidId.current++,
            x: 450,
            y: Math.random() * 300 + 25,
            size: Math.random() * 30 + 20,
          },
        ]);
      }

      setScore((prev) => prev + 1);
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameActive, gameOver, velocity, sailY]);

  const pulse = () => {
    if (!gameActive || gameOver) return;
    setVelocity((prev) => Math.max(prev - 3, -5));
    setPulseEffect(true);
    setTimeout(() => setPulseEffect(false), 200);
  };

  const startGame = () => {
    setSailY(200);
    setVelocity(0);
    setAsteroids([]);
    setScore(0);
    setGameActive(true);
    setGameOver(false);
    nextAsteroidId.current = 0;
  };

  const restartGame = () => {
    setGameActive(false);
    setGameOver(false);
    setTimeout(startGame, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif tracking-wider" style={{ color: "var(--parchment)", fontSize: "2rem" }}>
          The Solar Sail Pulse
        </h2>
        <div className="font-mono" style={{ color: "var(--molten-red)" }}>
          Distance: {Math.floor(score / 10)}
        </div>
      </div>

      <p className="font-mono opacity-70" style={{ color: "var(--copper)", fontSize: "0.95rem" }}>
        Navigate your solar sail through the asteroid field using laser pulses. Click to fire a pulse that pushes you upward!
      </p>

      <div
        className="relative rounded-lg overflow-hidden border-2 cursor-pointer"
        style={{
          height: "400px",
          backgroundColor: "rgba(10, 1, 24, 0.9)",
          borderColor: "var(--molten-red)",
          boxShadow: "0 0 40px rgba(165, 28, 48, 0.3)",
        }}
        onClick={gameActive && !gameOver ? pulse : undefined}
      >
        {gameActive && (
          <>
            <motion.div
              className="absolute"
              style={{
                left: "50px",
                top: `${sailY}px`,
                width: "60px",
                height: "60px",
              }}
              animate={{
                rotate: velocity * 5,
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: "#c0c0c0",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  boxShadow: "0 0 20px rgba(192, 192, 192, 0.5)",
                }}
              />
            </motion.div>

            <AnimatePresence>
              {pulseEffect && (
                <motion.div
                  initial={{ opacity: 1, height: 0 }}
                  animate={{ opacity: 0, height: 100 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute"
                  style={{
                    left: "80px",
                    top: `${sailY + 60}px`,
                    width: "4px",
                    backgroundColor: "var(--molten-red)",
                    boxShadow: "0 0 20px var(--molten-red)",
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {asteroids.map((asteroid) => (
                <motion.div
                  key={asteroid.id}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute rounded-full"
                  style={{
                    left: `${asteroid.x}px`,
                    top: `${asteroid.y}px`,
                    width: `${asteroid.size}px`,
                    height: `${asteroid.size}px`,
                    backgroundColor: "#4b5563",
                    border: "2px solid #6b7280",
                  }}
                />
              ))}
            </AnimatePresence>
          </>
        )}

        {!gameActive && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startGame}
              className="px-8 py-4 rounded-lg font-mono text-lg"
              style={{
                backgroundColor: "var(--molten-red)",
                color: "#fff",
                boxShadow: "0 0 30px rgba(165, 28, 48, 0.5)",
              }}
            >
              Launch Sail
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50">
            <div className="text-center space-y-4">
              <h3 className="font-serif" style={{ color: "var(--molten-red)", fontSize: "1.8rem" }}>
                Sail Destroyed!
              </h3>
              <p className="font-mono" style={{ color: "var(--parchment)" }}>
                Distance Traveled: {Math.floor(score / 10)}
              </p>
              <button
                onClick={restartGame}
                className="px-6 py-2 rounded-lg font-mono"
                style={{
                  backgroundColor: "var(--molten-red)",
                  color: "#fff",
                }}
              >
                Restart
              </button>
            </div>
          </div>
        )}
      </div>

      {gameActive && !gameOver && (
        <div className="text-center">
          <p className="font-mono opacity-70" style={{ color: "var(--copper)", fontSize: "0.9rem" }}>
            Click anywhere to fire laser pulse
          </p>
        </div>
      )}
    </div>
  );
}
