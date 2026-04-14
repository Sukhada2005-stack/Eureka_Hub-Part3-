import { useState } from "react";
import { motion } from "motion/react";

interface Node {
  id: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
  correct: boolean;
}

export function LatticeSnap() {
  const [level, setLevel] = useState(1);
  const [nodes, setNodes] = useState<Node[]>(generateLattice(4));
  const [solved, setSolved] = useState(false);

  function generateLattice(size: number): Node[] {
    const lattice: Node[] = [];
    let id = 0;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        lattice.push({
          id: id++,
          x: x * 60 + 50,
          y: y * 60 + 50,
          z: 0,
          rotation: Math.floor(Math.random() * 4) * 90,
          correct: false,
        });
      }
    }

    return lattice;
  }

  const rotateNode = (id: number) => {
    setNodes((prev) => {
      const updated = prev.map((node) => {
        if (node.id === id) {
          const newRotation = (node.rotation + 90) % 360;
          return {
            ...node,
            rotation: newRotation,
            correct: newRotation === 0,
          };
        }
        return node;
      });

      if (updated.every((n) => n.correct)) {
        setSolved(true);
      }

      return updated;
    });
  };

  const nextLevel = () => {
    setLevel((prev) => prev + 1);
    setNodes(generateLattice(4 + level));
    setSolved(false);
  };

  const reset = () => {
    setLevel(1);
    setNodes(generateLattice(4));
    setSolved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif tracking-wider" style={{ color: "var(--parchment)", fontSize: "2rem" }}>
          The Lattice Snap
        </h2>
        <div className="font-mono" style={{ color: "var(--nebula-teal)" }}>
          Level: {level}
        </div>
      </div>

      <p className="font-mono opacity-70" style={{ color: "var(--copper)", fontSize: "0.95rem" }}>
        Rotate the mercury nodes until they all align into a perfect Face-Centered Cubic lattice. Click each node to rotate it.
      </p>

      <div
        className="relative rounded-lg overflow-hidden border-2 flex items-center justify-center"
        style={{
          height: "400px",
          backgroundColor: "rgba(10, 1, 24, 0.8)",
          borderColor: "var(--nebula-teal)",
          boxShadow: solved ? "0 0 60px rgba(13, 148, 136, 0.8)" : "0 0 40px rgba(13, 148, 136, 0.3)",
        }}
      >
        <div className="relative" style={{ width: "280px", height: "280px" }}>
          {nodes.map((node) => (
            <motion.button
              key={node.id}
              onClick={() => rotateNode(node.id)}
              className="absolute rounded-full"
              style={{
                width: "40px",
                height: "40px",
                left: `${node.x}px`,
                top: `${node.y}px`,
                backgroundColor: node.correct ? "var(--nebula-teal)" : "#6b7280",
                boxShadow: node.correct
                  ? "0 0 30px var(--nebula-teal)"
                  : "0 0 10px rgba(107, 114, 128, 0.5)",
                border: "2px solid rgba(232, 213, 183, 0.3)",
              }}
              animate={{
                rotate: node.rotation,
                scale: node.correct ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: "#e8d5b7",
                    position: "absolute",
                    top: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
            </motion.button>
          ))}
        </div>

        {solved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
          >
            <div className="text-center space-y-4">
              <motion.h3
                className="font-serif"
                style={{ color: "var(--nebula-teal)", fontSize: "2.5rem" }}
                animate={{
                  textShadow: [
                    "0 0 20px rgba(13, 148, 136, 0.5)",
                    "0 0 40px rgba(13, 148, 136, 0.9)",
                    "0 0 20px rgba(13, 148, 136, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                SNAP!
              </motion.h3>
              <p className="font-mono" style={{ color: "var(--parchment)" }}>
                Perfect Lattice Aligned
              </p>
              <button
                onClick={nextLevel}
                className="px-6 py-2 rounded-lg font-mono"
                style={{
                  backgroundColor: "var(--nebula-teal)",
                  color: "#fff",
                }}
              >
                Next Level
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={reset}
          className="px-6 py-2 rounded-lg font-mono opacity-70 hover:opacity-100 transition-opacity"
          style={{
            backgroundColor: "var(--secondary)",
            color: "var(--parchment)",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
