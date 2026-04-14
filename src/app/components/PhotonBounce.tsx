import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Prism {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

interface BeamSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export function PhotonBounce() {
  const [level, setLevel] = useState(1);
  const [prisms, setPrisms] = useState<Prism[]>([]);
  const [candlePos, setCandlePos] = useState({ x: 420, y: 200 });
  const [beamPath, setBeamPath] = useState<BeamSegment[]>([]);
  const [solved, setSolved] = useState(false);
  const [rainbow, setRainbow] = useState(false);

  useEffect(() => {
    generateLevel(level);
  }, [level]);

  const generateLevel = (lvl: number) => {
    const numPrisms = Math.min(3 + lvl, 8);
    const newPrisms: Prism[] = [];

    for (let i = 0; i < numPrisms; i++) {
      newPrisms.push({
        id: i,
        x: 100 + (i % 3) * 120,
        y: 80 + Math.floor(i / 3) * 100,
        rotation: Math.floor(Math.random() * 8) * 45,
      });
    }

    setPrisms(newPrisms);
    setCandlePos({
      x: 420,
      y: 100 + Math.random() * 200,
    });
    setSolved(false);
    setRainbow(false);
  };

  useEffect(() => {
    calculateBeamPath();
  }, [prisms]);

  const calculateBeamPath = () => {
    const segments: BeamSegment[] = [];
    let currentX = 20;
    let currentY = 200;
    let angle = 0; // degrees, 0 = right
    let bounces = 0;
    const maxBounces = 20;

    while (bounces < maxBounces && currentX < 500 && currentY > 0 && currentY < 400) {
      // Find next intersection with prism
      let nearestPrism: Prism | null = null;
      let nearestDist = Infinity;

      prisms.forEach((prism) => {
        const dx = prism.x - currentX;
        const dy = prism.y - currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if beam is heading towards this prism
        const angleToTarget = (Math.atan2(dy, dx) * 180) / Math.PI;
        const angleDiff = Math.abs(((angleToTarget - angle + 180) % 360) - 180);

        if (dist < nearestDist && dist > 5 && angleDiff < 45) {
          nearestDist = dist;
          nearestPrism = prism;
        }
      });

      if (nearestPrism) {
        // Draw segment to prism
        segments.push({
          x1: currentX,
          y1: currentY,
          x2: nearestPrism.x,
          y2: nearestPrism.y,
          color: "#ffffff",
        });

        // Reflect based on prism rotation
        const reflectionAngle = nearestPrism.rotation * 2 - angle;
        angle = reflectionAngle;

        currentX = nearestPrism.x;
        currentY = nearestPrism.y;
        bounces++;
      } else {
        // No more prisms, draw to edge or candle
        const endX = currentX + Math.cos((angle * Math.PI) / 180) * 500;
        const endY = currentY + Math.sin((angle * Math.PI) / 180) * 500;

        segments.push({
          x1: currentX,
          y1: currentY,
          x2: endX,
          y2: endY,
          color: "#ffffff",
        });

        // Check if beam hits candle
        const distToCandle = Math.sqrt(
          Math.pow(candlePos.x - currentX, 2) + Math.pow(candlePos.y - currentY, 2)
        );

        const angleToCandle = (Math.atan2(candlePos.y - currentY, candlePos.x - currentX) * 180) / Math.PI;
        const angleDiff = Math.abs(((angleToCandle - angle + 180) % 360) - 180);

        if (distToCandle < 200 && angleDiff < 15) {
          if (!solved) {
            setSolved(true);
            triggerRainbow();
          }
        }

        break;
      }
    }

    setBeamPath(segments);
  };

  const triggerRainbow = () => {
    setRainbow(true);
    setTimeout(() => {
      setRainbow(false);
      setTimeout(() => {
        setLevel((prev) => prev + 1);
      }, 500);
    }, 1500);
  };

  const rotatePrism = (id: number) => {
    if (solved) return;
    setPrisms((prev) =>
      prev.map((prism) =>
        prism.id === id ? { ...prism, rotation: (prism.rotation + 45) % 360 } : prism
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif tracking-wider" style={{ color: "var(--parchment)", fontSize: "2rem" }}>
          The Photon Bounce
        </h2>
        <div className="font-mono" style={{ color: "var(--electric-blue)" }}>
          Level: {level}
        </div>
      </div>

      <p className="font-mono opacity-70" style={{ color: "var(--copper)", fontSize: "0.95rem" }}>
        Guide the starlight beam through the prisms to ignite the stellar candle. Click prisms to rotate them by 45°.
      </p>

      <div
        className="relative rounded-lg overflow-hidden border-2"
        style={{
          height: "400px",
          backgroundColor: rainbow ? "rgba(10, 1, 24, 0.3)" : "rgba(10, 1, 24, 0.95)",
          borderColor: "var(--electric-blue)",
          boxShadow: solved ? "0 0 60px rgba(59, 130, 246, 0.8)" : "0 0 40px rgba(59, 130, 246, 0.3)",
          transition: "all 0.5s ease",
        }}
      >
        {/* Light Source */}
        <div
          className="absolute w-6 h-6 rounded-full"
          style={{
            left: "10px",
            top: "190px",
            backgroundColor: "#ffffff",
            boxShadow: "0 0 30px #ffffff",
          }}
        />

        {/* Beam Path */}
        <svg className="absolute inset-0 pointer-events-none" width="500" height="400">
          {beamPath.map((segment, index) => (
            <motion.line
              key={index}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke={rainbow ? `hsl(${index * 60}, 100%, 60%)` : segment.color}
              strokeWidth={rainbow ? "4" : "2"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{
                filter: rainbow
                  ? `drop-shadow(0 0 10px hsl(${index * 60}, 100%, 60%))`
                  : "drop-shadow(0 0 8px #ffffff)",
              }}
            />
          ))}
        </svg>

        {/* Prisms */}
        {prisms.map((prism) => (
          <motion.button
            key={prism.id}
            onClick={() => rotatePrism(prism.id)}
            className="absolute cursor-pointer"
            style={{
              left: `${prism.x - 25}px`,
              top: `${prism.y - 25}px`,
              width: "50px",
              height: "50px",
            }}
            animate={{ rotate: prism.rotation }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1 }}
          >
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6))",
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            />
          </motion.button>
        ))}

        {/* Stellar Candle */}
        <motion.div
          className="absolute"
          style={{
            left: `${candlePos.x - 15}px`,
            top: `${candlePos.y - 30}px`,
            width: "30px",
            height: "60px",
          }}
          animate={{
            filter: solved
              ? [
                  "drop-shadow(0 0 20px var(--amber))",
                  "drop-shadow(0 0 40px var(--amber))",
                  "drop-shadow(0 0 20px var(--amber))",
                ]
              : "drop-shadow(0 0 5px var(--copper))",
          }}
          transition={{ duration: 1, repeat: solved ? Infinity : 0 }}
        >
          <div
            className="w-full h-full rounded-t-full"
            style={{
              backgroundColor: solved ? "var(--amber)" : "var(--copper)",
              position: "relative",
            }}
          >
            {solved && (
              <motion.div
                className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "30px",
                    background: "linear-gradient(to top, var(--amber), transparent)",
                    filter: "blur(4px)",
                  }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Rainbow Effect */}
        <AnimatePresence>
          {rainbow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255,0,0,0.2), rgba(255,127,0,0.2), rgba(255,255,0,0.2), rgba(0,255,0,0.2), rgba(0,0,255,0.2), rgba(75,0,130,0.2), rgba(148,0,211,0.2))",
                filter: "blur(20px)",
              }}
            />
          )}
        </AnimatePresence>

        {rainbow && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3
              className="font-serif"
              style={{
                fontSize: "3rem",
                color: "var(--parchment)",
                textShadow: "0 0 40px rgba(251, 191, 36, 0.8)",
              }}
            >
              IGNITED!
            </h3>
          </motion.div>
        )}
      </div>
    </div>
  );
}
