'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface CircleAnimationProps {
  isActive: boolean;
  color: string;
  size: number;
  isSpeaking?: boolean;
}

interface Particle {
  x: number;
  y: number;
  angle: number;
  baseRadius: number;
  orbitSpeed: number;
  pulseSpeed: number;
  size: number;
  opacity: number;
  layer: number;
  direction: number;
  energy: number;
  hue: number;
}

interface GlowColors {
  primary: string;
  secondary: string;
  accent: string;
}

function getThemeColors(baseColor: string): GlowColors {
  // Dark theme color mapping
  switch (baseColor) {
    case '#FF453A': // Error state
      return {
        primary: '#FF453A',
        secondary: '#FF6B6B',
        accent: '#FF8585'
      };
    case '#4ADE80': // Success state (not speaking)
      return {
        primary: '#4ADE80',
        secondary: '#6EE7B7',
        accent: '#34D399'
      };
    case '#A855F7': // Speaking state
      return {
        primary: '#A855F7',
        secondary: '#C084FC',
        accent: '#8B46CC'
      };
    default: // Idle state
      return {
        primary: '#6B7280',
        secondary: '#9CA3AF',
        accent: '#4B5563'
      };
  }
}

export function CircleAnimation({ isActive, color, size, isSpeaking = false }: CircleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radius = size / 2;
  const numParticles = 180;
  const particles = useRef<Particle[]>([]);
  const energyLevelRef = useRef(0);
  const themeColors = getThemeColors(color);

  useEffect(() => {
    particles.current = Array.from({ length: numParticles }, (_, i) => {
      const angle = (i / numParticles) * Math.PI * 2;
      return {
        x: 0,
        y: 0,
        angle,
        baseRadius: radius * (0.3 + Math.random() * 0.5),
        orbitSpeed: (0.0003 + Math.random() * 0.0007) * (Math.random() > 0.5 ? 1 : -1),
        pulseSpeed: 0.01 + Math.random() * 0.02,
        size: 0.8 + Math.random() * 2.2,
        opacity: 0.2 + Math.random() * 0.5,
        layer: Math.floor(Math.random() * 4),
        direction: Math.random() > 0.5 ? 1 : -1,
        energy: Math.random(),
        hue: Math.random() * 20 - 10
      };
    });
  }, [radius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;


    const drawGlowingRing = (centerX: number, centerY: number, radius: number, width: number, opacity: number, blur = 0) => {
      ctx.save();
      if (blur > 0) {
        ctx.shadowBlur = blur;
        ctx.shadowColor = `${themeColors.primary}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
      }

      const segments = 180;
      ctx.beginPath();
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const variation = Math.sin(angle * 8 + time) * 2;
        const r = radius + variation;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `${themeColors.secondary}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = width;
      ctx.stroke();
      ctx.restore();
    };

    const drawParticleTrail = (x: number, y: number, size: number, opacity: number, angle: number, color: string) => {
      const trailLength = 5;
      const gradient = ctx.createLinearGradient(
        x - Math.cos(angle) * trailLength,
        y - Math.sin(angle) * trailLength,
        x,
        y
      );
      gradient.addColorStop(0, `${color}00`);
      gradient.addColorStop(1, `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
      
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(angle) * trailLength, y - Math.sin(angle) * trailLength);
      ctx.lineTo(x, y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = size * 2;
      ctx.stroke();
    };

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, size, size);

      const bgGradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
      bgGradient.addColorStop(0, `${themeColors.primary}15`);
      bgGradient.addColorStop(0.4, `${themeColors.secondary}08`);
      bgGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, size, size);

      if (isSpeaking) {
        const targetEnergy = 0.5 + Math.sin(time * 4) * 0.2 + Math.random() * 0.3;
        energyLevelRef.current += (targetEnergy - energyLevelRef.current) * 0.15;
      } else {
        energyLevelRef.current *= 0.93;
      }

      const baseExpansion = 1 + energyLevelRef.current * (isSpeaking ? 0.4 : 0.1);
      const waveEffect = Math.sin(time * 2) * 0.05;
      const expansionFactor = baseExpansion + waveEffect;

      for (let i = 0; i < 5; i++) {
        const ringRadius = radius * (0.65 + i * 0.09) * expansionFactor;
        const ringOpacity = (0.15 - i * 0.02) * (1 + energyLevelRef.current);
        drawGlowingRing(
          radius, 
          radius, 
          ringRadius, 
          1 + (i === 0 ? 1 : 0), 
          ringOpacity, 
          10 + i * 2
        );
      }

      const sortedParticles = [...particles.current].sort((a, b) => a.layer - b.layer);

      sortedParticles.forEach((particle, i) => {
        if (isActive) {
          particle.angle += particle.orbitSpeed * (1 + energyLevelRef.current * 2) * particle.direction;
        }

        const layerOffset = particle.layer * 0.2;
        const particleRadius = particle.baseRadius * (1 + layerOffset) * expansionFactor;
        const wobble = Math.sin(time * particle.pulseSpeed + particle.angle) * 5;
        const finalRadius = particleRadius + wobble;

        particle.x = radius + Math.cos(particle.angle) * finalRadius;
        particle.y = radius + Math.sin(particle.angle) * finalRadius;

        const layerScale = 1 + layerOffset * 0.5;
        const particleSize = particle.size * layerScale * (1 + energyLevelRef.current * 0.5);
        const baseOpacity = particle.opacity * (1 - layerOffset * 0.3) * (1 + energyLevelRef.current * 0.3);
        const pulsingOpacity = baseOpacity * (0.7 + Math.sin(time * 2 + i) * 0.3);

        if (isActive && particle.layer === 2) {
          const particleColor = particle.layer % 2 === 0 ? themeColors.primary : themeColors.accent;
          drawParticleTrail(
            particle.x,
            particle.y,
            particleSize,
            pulsingOpacity * 0.6,
            particle.angle,
            particleColor
          );
        }

        ctx.save();
        ctx.shadowBlur = particleSize * 3;
        ctx.shadowColor = `${themeColors.accent}${Math.floor(pulsingOpacity * 120).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `${themeColors.primary}${Math.floor(pulsingOpacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
        ctx.restore();

        if (i % 2 === 0) {
          const nextParticle = sortedParticles[(i + 1) % sortedParticles.length];
          if (particle.layer === nextParticle.layer) {
            const distance = Math.hypot(nextParticle.x - particle.x, nextParticle.y - particle.y);
            const maxDistance = radius * 0.5;

            if (distance < maxDistance) {
              const lineOpacity = (1 - distance / maxDistance) * 0.4 * (1 + energyLevelRef.current);
              const gradient = ctx.createLinearGradient(
                particle.x, particle.y, 
                nextParticle.x, nextParticle.y
              );
              gradient.addColorStop(0, `${themeColors.primary}${Math.floor(lineOpacity * 255).toString(16).padStart(2, '0')}`);
              gradient.addColorStop(1, `${themeColors.secondary}${Math.floor(lineOpacity * 255).toString(16).padStart(2, '0')}`);
              ctx.strokeStyle = gradient;
              ctx.lineWidth = (0.5 * (1 + energyLevelRef.current * 0.5)) * (1 - particle.layer * 0.2);
              ctx.stroke();
            }
          }
        }
      });

      const coreSize = radius * 0.15 * (1 + energyLevelRef.current * 0.3);
    //   const corePulse = Math.sin(time * 3) * 3 * (1 + energyLevelRef.current);

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(time * 0.2);

      for (let i = 0; i < 4; i++) {
        const layerSize = coreSize * (1 - i * 0.15);
        const rotationOffset = time * (0.1 + i * 0.1);
        
        ctx.save();
        ctx.rotate(rotationOffset);
        
        const points = 6 + i;
        ctx.beginPath();
        for (let j = 0; j < points; j++) {
          const angle = (j / points) * Math.PI * 2;
          const dist = layerSize * (1 + Math.sin(time * 2 + i) * 0.1);
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        const patternColor = i % 2 === 0 ? themeColors.primary : themeColors.secondary;
        ctx.strokeStyle = `${patternColor}${Math.floor((0.4 - i * 0.05) * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();
      }

      ctx.restore();

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isActive, isSpeaking, color, size, radius, themeColors]);

  return (
    <motion.canvas
      ref={canvasRef}
      width={size}
      height={size}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-full"
    />
  );
} 