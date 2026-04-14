import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Atom {
  id: number;
  element: string;
  atomicNumber: number;
  x: number;
  y: number;
  falling: boolean;
  color: string;
}

const ELEMENTS = [
  { symbol: "H", number: 1, color: "#FBBF24" },
  { symbol: "He", number: 2, color: "#0D9488" },
  { symbol: "Li", number: 3, color: "#3b82f6" },
  { symbol: "Be", number: 4, color: "#a855f7" },
  { symbol: "B", number: 5, color: "#f97316" },
  { symbol: "C", number: 6, color: "#ec4899" },
  { symbol: "N", number: 7, color: "#10b981" },
  { symbol: "O", number: 8, color: "#06b6d4" },
];

export function FusionMerge() {
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [nextId, setNextId] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [flares, setFlares] = useState<{ id: number; x: number; y: number }[]>([]);

  const dropAtom = () => {
    if (gameOver || atoms.length >= 8) {
      setGameOver(true);
      return;
    }

    const randomElement = ELEMENTS[Math.floor(Math.random() * Math.min(3, ELEMENTS.length))];
    const newAtom: Atom = {
      id: nextId,
      element: randomElement.symbol,
      atomicNumber: randomElement.number,
      x: Math.random() * 300 + 50,
      y: 20,
      falling: true,
      color: randomElement.color,
    };

    setAtoms((prev) => [...prev, newAtom]);
    setNextId((prev) => prev + 1);

    setTimeout(() => {
      setAtoms((prev) =>
        prev.map((atom) => (atom.id === newAtom.id ? { ...atom, falling: false, y: 150 + Math.random() * 100 } : atom))
      );
      checkForMerge(newAtom);
    }, 500);
  };

  const checkForMerge = (newAtom: Atom) => {
    setAtoms((currentAtoms) => {
      const atomsToMerge = currentAtoms.filter(
        (atom) =>
          atom.id !== newAtom.id &&
          atom.atomicNumber === newAtom.atomicNumber &&
          Math.abs(atom.x - newAtom.x) < 60 &&
          Math.abs(atom.y - newAtom.y) < 60
      );

      if (atomsToMerge.length > 0) {
        const mergeWith = atomsToMerge[0];
        const nextElement = ELEMENTS.find((el) => el.number === newAtom.atomicNumber + 1);

        if (nextElement) {
          const flareId = Date.now();
          setFlares((prev) => [...prev, { id: flareId, x: mergeWith.x, y: mergeWith.y }]);
          setTimeout(() => {
            setFlares((prev) => prev.filter((f) => f.id !== flareId));
          }, 1000);

          setScore((prev) => prev + nextElement.number * 10);

          const mergedAtom: Atom = {
            id: nextId + 1,
            element: nextElement.symbol,
            atomicNumber: nextElement.number,
            x: (newAtom.x + mergeWith.x) / 2,
            y: (newAtom.y + mergeWith.y) / 2,
            falling: false,
            color: nextElement.color,
          };
          setNextId((prev) => prev + 1);

          return [...currentAtoms.filter((a) => a.id !== newAtom.id && a.id !== mergeWith.id), mergedAtom];
        }
      }

      return currentAtoms;
    });
  };

  const resetGame = () => {
    setAtoms([]);
    setScore(0);
    setGameOver(false);
    setNextId(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif tracking-wider" style={{ color: "var(--parchment)", fontSize: "2rem" }}>
          The Fusion Merge
        </h2>
        <div className="font-mono" style={{ color: "var(--amber)" }}>
          Score: {score}
        </div>
      </div>

      <p className="font-mono opacity-70" style={{ color: "var(--copper)", fontSize: "0.95rem" }}>
        Drop atoms into the sun. When identical atoms touch, they fuse into heavier elements. Build the heaviest element before the sun overflows!
      </p>

      <div
        className="relative rounded-lg overflow-hidden border-2"
        style={{
          height: "400px",
          backgroundColor: "rgba(10, 1, 24, 0.6)",
          borderColor: "var(--amber)",
          boxShadow: "0 0 40px rgba(251, 191, 36, 0.3)",
        }}
      >
        <AnimatePresence>
          {atoms.map((atom) => (
            <motion.div
              key={atom.id}
              initial={{ y: atom.y, x: atom.x, scale: 0 }}
              animate={{ y: atom.y, x: atom.x, scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute rounded-full flex items-center justify-center font-mono font-bold cursor-pointer"
              style={{
                width: "50px",
                height: "50px",
                left: `${atom.x}px`,
                top: `${atom.y}px`,
                backgroundColor: atom.color,
                boxShadow: `0 0 20px ${atom.color}`,
                color: "#fff",
              }}
            >
              {atom.element}
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {flares.map((flare) => (
            <motion.div
              key={flare.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute rounded-full"
              style={{
                width: "50px",
                height: "50px",
                left: `${flare.x}px`,
                top: `${flare.y}px`,
                backgroundColor: "var(--amber)",
                boxShadow: "0 0 60px var(--amber)",
              }}
            />
          ))}
        </AnimatePresence>

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50">
            <div className="text-center space-y-4">
              <h3 className="font-serif" style={{ color: "var(--parchment)", fontSize: "1.8rem" }}>
                Sun Overflow!
              </h3>
              <p className="font-mono" style={{ color: "var(--amber)" }}>
                Final Score: {score}
              </p>
              <button
                onClick={resetGame}
                className="px-6 py-2 rounded-lg font-mono"
                style={{
                  backgroundColor: "var(--nebula-teal)",
                  color: "#fff",
                }}
              >
                Restart
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={dropAtom}
          disabled={gameOver}
          className="px-8 py-3 rounded-lg font-mono transition-all disabled:opacity-50"
          style={{
            backgroundColor: "var(--amber)",
            color: "var(--deep-space)",
            boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
          }}
        >
          Drop Atom
        </button>
      </div>
    </div>
  );
}
