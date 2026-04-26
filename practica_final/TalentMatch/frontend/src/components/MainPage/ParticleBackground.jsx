import React, {useState, useEffect, useRef} from "react";

function ParticleBackground() {
  const [particles, setParticles] = useState([]);
  const styleRef = useRef(null);

  // Generate CSS for particles
  const generateStyles = (particlesList) => {
    if (!particlesList || particlesList.length === 0) return '';
    return particlesList.map(p => {
      const stretch1 = p.stretchAmount;
      const stretch2 = p.stretchAmount * 1.5;
      const stretch3 = p.stretchAmount * 2;
      return `
        @keyframes ${p.id} {
          0% {
            opacity: 0;
            transform: rotate(${p.rotation}deg) scaleX(0.3) scaleY(0.3);
          }
          20% {
            opacity: 0.8;
            transform: rotate(${p.rotation}deg) scaleX(1) scaleY(1);
          }
          50% {
            opacity: 0.9;
            transform: rotate(${p.rotation}deg) scaleX(${stretch1}) scaleY(0.7);
          }
          80% {
            opacity: 0.5;
            transform: rotate(${p.rotation}deg) scaleX(${stretch2}) scaleY(0.5);
          }
          100% {
            opacity: 0;
            transform: rotate(${p.rotation}deg) scaleX(${stretch3}) scaleY(0.3);
          }
        }
      `;
    }).join('\n');
  };

  useEffect(() => {
    const createParticle = () => {
      const purpleShades = [
        'rgba(147, 51, 234, 0.6)',   // purple-600
        'rgba(168, 85, 247, 0.55)',  // purple-500
        'rgba(192, 132, 252, 0.5)',  // purple-400
        'rgba(221, 214, 254, 0.45)', // purple-300
        'rgba(233, 213, 255, 0.4)',  // purple-200
      ];

      const rotation = Math.random() * 360;
      const duration = 4000 + Math.random() * 3000;
      const stretchAmount = 1.5 + Math.random() * 1.5;
      const id = `p${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        id: id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        width: 60 + Math.random() * 140,
        height: 30 + Math.random() * 50,
        rotation: rotation,
        color: purpleShades[Math.floor(Math.random() * purpleShades.length)],
        duration: duration,
        delay: 0, // Start immediately
        createdAt: Date.now(),
        stretchAmount: stretchAmount,
      };
    };

    // Create initial particles
    const initialParticles = Array.from({ length: 8 }, createParticle);
    setParticles(initialParticles);

    // Add new particles periodically
    const interval = setInterval(() => {
      setParticles(prev => {
        const now = Date.now();
        const filtered = prev.filter(p => {
          const elapsed = now - p.createdAt;
          return elapsed < p.duration + p.delay + 2000;
        });
        
        const newParticles = Array.from({ 
          length: Math.random() < 0.7 ? 1 : 2 
        }, createParticle);
        
        return [...filtered, ...newParticles].slice(-15);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update styles when particles change
  useEffect(() => {
    if (styleRef.current) {
      styleRef.current.textContent = generateStyles(particles);
    }
  }, [particles]);

  return (
    <>
      <style ref={styleRef} />
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              backgroundColor: particle.color,
              borderRadius: '16px',
              transformOrigin: 'center center',
              animation: `${particle.id} ${particle.duration}ms ease-in-out ${particle.delay}ms forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export default ParticleBackground;