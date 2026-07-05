"use client";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 95}%`,
  size: 2 + (i % 3),
  delay: `${(i * 1.3) % 12}s`,
  duration: `${10 + (i % 8)}s`,
}));

interface AIBackgroundProps {
  showParticles?: boolean;
  showGrid?: boolean;
  showScanLine?: boolean;
}

export function AIBackground({
  showParticles = true,
  showGrid = true,
  showScanLine = false,
}: AIBackgroundProps) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="ai-bg-base absolute inset-0" />
      {showGrid && <div className="ai-grid absolute inset-0 opacity-60" />}

      <div className="animated-blob blob-1 absolute h-[520px] w-[520px] rounded-full blur-3xl blob-cyan" />
      <div className="animated-blob blob-2 absolute h-[460px] w-[460px] rounded-full blur-3xl blob-violet" />
      <div className="animated-blob blob-3 absolute h-[380px] w-[380px] rounded-full blur-3xl blob-blue" />
      <div className="animated-blob blob-4 absolute h-[320px] w-[320px] rounded-full blur-3xl blob-cyan" />

      {showParticles &&
        PARTICLES.map((p) => (
          <span
            key={p.id}
            className="ai-particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}

      {showScanLine && <div className="scan-line" />}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060818]/80" />
    </div>
  );
}
