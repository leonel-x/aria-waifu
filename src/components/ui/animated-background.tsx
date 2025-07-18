import { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
  theme: string;
}

const themeClasses = {
  water: "bg-water",
  mist: "bg-mist",
  fire: "bg-fire",
  aura: "bg-aura",
  void: "bg-void",
  wind: "bg-wind",
  smoke: "bg-smoke"
};

export function AnimatedBackground({ theme }: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing particles
    container.innerHTML = "";

    // Create floating particles
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "floating-particle";
      
      // Random size and position
      const size = Math.random() * 4 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Theme-specific colors
      const colors = {
        water: ["#3b82f6", "#06b6d4", "#0ea5e9"],
        mist: ["#9ca3af", "#6b7280", "#d1d5db"],
        fire: ["#f97316", "#dc2626", "#fbbf24"],
        aura: ["#8b5cf6", "#a855f7", "#c084fc"],
        void: ["#312e81", "#1e1b4b", "#4338ca"],
        wind: ["#06b6d4", "#0891b2", "#22d3ee"],
        smoke: ["#6b7280", "#9ca3af", "#4b5563"]
      };
      
      const themeColors = colors[theme as keyof typeof colors] || colors.aura;
      particle.style.backgroundColor = themeColors[Math.floor(Math.random() * themeColors.length)];
      
      // Animation delay
      particle.style.animationDelay = `${Math.random() * 3}s`;
      
      container.appendChild(particle);
    }
  }, [theme]);

  const themeClass = themeClasses[theme as keyof typeof themeClasses] || themeClasses.aura;

  return (
    <div className={`fixed inset-0 ${themeClass} transition-all duration-1000 ease-in-out`}>
      <div ref={containerRef} className="absolute inset-0 overflow-hidden"></div>
    </div>
  );
}
