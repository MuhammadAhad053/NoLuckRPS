import React, { useEffect, useRef } from 'react';

export const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      life: number;
      maxLife: number;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
        
        const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ffffff', '#ef4444'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.8 + 0.2;
        this.life = 0;
        this.maxLife = Math.random() * 100 + 50;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;

        // Add some "jitter" for lightning effect
        if (Math.random() > 0.95) {
          this.speedX += (Math.random() - 0.5) * 2;
          this.speedY += (Math.random() - 0.5) * 2;
        }

        if (this.life > this.maxLife || this.x > canvas!.width || this.x < 0 || this.y > canvas!.height || this.y < 0) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        const currentOpacity = this.opacity * (1 - this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = currentOpacity;
        
        // Draw spark
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Occasionally draw a "lightning" line
        if (Math.random() > 0.99) {
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20);
          ctx.stroke();
        }
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 15000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{ filter: 'blur(1px)' }}
    />
  );
};
