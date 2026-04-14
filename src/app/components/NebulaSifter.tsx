import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

interface Isotope {
  id: number;
  x: number;
  y: number;
  element: string;
  collected: boolean;
}

interface Trail {
  x: number;
  y: number;
  opacity: number;
}

const NEBULA_COLORS = [
  "rgba(168, 85, 247, 0.6)", // purple
  "rgba(147, 51, 234, 0.6)", // deep purple
  "rgba(16, 185, 129, 0.6)", // green
  "rgba(13, 148, 136, 0.6)", // teal
  "rgba(59, 130, 246, 0.5)", // blue
];

const ISOTOPES = [
  { symbol: "Fe", name: "Iron", color: "#ef4444" },
  { symbol: "Au", name: "Gold", color: "#FBBF24" },
  { symbol: "Pt", name: "Platinum", color: "#c0c0c0" },
  { symbol: "U", name: "Uranium", color: "#10b981" },
  { symbol: "Ag", name: "Silver", color: "#e5e7eb" },
];

export function NebulaSifter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 200, y: 200 });
  const [trail, setTrail] = useState<Trail[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isotopes, setIsotopes] = useState<Isotope[]>([]);
  const [collected, setCollected] = useState<string[]>([]);
  const [showPopEffect, setShowPopEffect] = useState<{ x: number; y: number } | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const animationFrame = useRef<number>();

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Initialize particles
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      initialParticles.push({
        x: Math.random() * 500,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)],
        size: Math.random() * 3 + 2,
      });
    }
    setParticles(initialParticles);

    // Initialize isotopes
    const initialIsotopes: Isotope[] = [];
    for (let i = 0; i < 5; i++) {
      const randomIsotope = ISOTOPES[Math.floor(Math.random() * ISOTOPES.length)];
      initialIsotopes.push({
        id: i,
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50,
        element: randomIsotope.symbol,
        collected: false,
      });
    }
    setIsotopes(initialIsotopes);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, 500, 400);

      // Draw particles
      particles.forEach((particle) => {
        // Apply cursor attraction
        const dx = mousePos.x - particle.x;
        const dy = mousePos.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          const force = (80 - dist) / 80;
          particle.vx += (dx / dist) * force * 0.3;
          particle.vy += (dy / dist) * force * 0.3;
        }

        // Apply friction
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary bounce
        if (particle.x < 0 || particle.x > 500) particle.vx *= -1;
        if (particle.y < 0 || particle.y > 400) particle.vy *= -1;

        particle.x = Math.max(0, Math.min(500, particle.x));
        particle.y = Math.max(0, Math.min(400, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw trail
      trail.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${point.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(251, 191, 36, 0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [particles, mousePos, trail]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    // Add to trail
    setTrail((prev) => {
      const newTrail = [...prev, { x, y, opacity: 0.8 }];
      if (newTrail.length > 20) newTrail.shift();
      return newTrail;
    });

    // Check for isotope collection
    isotopes.forEach((isotope) => {
      if (!isotope.collected) {
        const dx = x - isotope.x;
        const dy = y - isotope.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 25) {
          collectIsotope(isotope);
        }
      }
    });
  };

  useEffect(() => {
    // Fade trail
    const interval = setInterval(() => {
      setTrail((prev) =>
        prev
          .map((point) => ({ ...point, opacity: point.opacity - 0.05 }))
          .filter((point) => point.opacity > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const playPopSound = () => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.current.currentTime + 0.1);
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.2);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + 0.2);
  };

  const collectIsotope = (isotope: Isotope) => {
    setIsotopes((prev) =>
      prev.map((iso) =>
        iso.id === isotope.id ? { ...iso, collected: true } : iso
      )
    );
    setCollected((prev) => [...prev, isotope.element]);
    setShowPopEffect({ x: isotope.x, y: isotope.y });
    playPopSound();

    setTimeout(() => setShowPopEffect(null), 500);

    // Spawn new isotope after collection
    setTimeout(() => {
      const randomIsotope = ISOTOPES[Math.floor(Math.random() * ISOTOPES.length)];
      setIsotopes((prev) => [
        ...prev.filter((iso) => iso.id !== isotope.id),
        {
          id: Date.now(),
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
          element: randomIsotope.symbol,
          collected: false,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif tracking-wider" style={{ color: "var(--parchment)", fontSize: "2rem" }}>
          The Nebula Sifter
        </h2>
        <div className="font-mono" style={{ color: "var(--purple-smoke)" }}>
          Collected: {collected.length}
        </div>
      </div>

      <p className="font-mono opacity-70" style={{ color: "var(--copper)", fontSize: "0.95rem" }}>
        Stir the cosmic nebula with your magnetic lens to reveal hidden heavy-metal isotopes. Watch the fluid particles react to your movements!
      </p>

      <div
        className="relative rounded-lg overflow-hidden border-2 cursor-none"
        style={{
          height: "400px",
          backgroundColor: "#000000",
          borderColor: "var(--purple-smoke)",
          boxShadow: "0 0 40px rgba(168, 85, 247, 0.3)",
        }}
        onMouseMove={handleMouseMove}
      >
        <canvas ref={canvasRef} width={500} height={400} className="absolute inset-0" />

        <AnimatePresence>
          {isotopes.map((isotope) =>
            !isotope.collected ? (
              <motion.div
                key={isotope.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute rounded-full flex items-center justify-center font-mono font-bold pointer-events-none"
                style={{
                  width: "40px",
                  height: "40px",
                  left: `${isotope.x - 20}px`,
                  top: `${isotope.y - 20}px`,
                  backgroundColor: ISOTOPES.find((i) => i.symbol === isotope.element)?.color,
                  boxShadow: `0 0 30px ${ISOTOPES.find((i) => i.symbol === isotope.element)?.color}`,
                  color: "#000",
                }}
              >
                {isotope.element}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPopEffect && (
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "40px",
                height: "40px",
                left: `${showPopEffect.x - 20}px`,
                top: `${showPopEffect.y - 20}px`,
                border: "3px solid var(--amber)",
                boxShadow: "0 0 40px var(--amber)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Magnetic Lens Cursor */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "50px",
            height: "50px",
            left: `${mousePos.x - 25}px`,
            top: `${mousePos.y - 25}px`,
            border: "3px solid var(--amber)",
            boxShadow: "0 0 20px var(--amber), inset 0 0 20px rgba(251, 191, 36, 0.2)",
            transition: "all 0.05s ease-out",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)",
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="font-mono text-sm" style={{ color: "var(--copper)" }}>
          Materials Collected:
        </span>
        {collected.map((element, index) => (
          <motion.span
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 rounded-full font-mono text-sm"
            style={{
              backgroundColor: "var(--secondary)",
              color: ISOTOPES.find((i) => i.symbol === element)?.color,
              border: `1px solid ${ISOTOPES.find((i) => i.symbol === element)?.color}`,
            }}
          >
            {element}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
