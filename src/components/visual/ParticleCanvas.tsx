import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleCanvasProps {
  variant?: 'hero' | 'auth';
  className?: string;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ variant = 'hero', className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;

    if (!canvas || !parent) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = variant === 'auth' ? 5.4 : 6.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const count = variant === 'auth' ? 620 : 920;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const radius = 2.2 + Math.random() * 4.8;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = Math.sin(angle) * radius - Math.random() * 2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xff9a3d,
      size: variant === 'auth' ? 0.026 : 0.022,
      transparent: true,
      opacity: variant === 'auth' ? 0.72 : 0.56,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const shapes: THREE.Mesh[] = [];

    if (variant === 'auth') {
      const material = new THREE.MeshStandardMaterial({
        color: 0xff6b35,
        emissive: 0x421506,
        roughness: 0.42,
        metalness: 0.36,
      });
      const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0xf4a523,
        emissive: 0x3a2500,
        roughness: 0.48,
        metalness: 0.28,
      });

      const torus = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.18, 24, 80), material);
      torus.position.set(-1.45, 0.9, 0);
      const spice = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48, 0), accentMaterial);
      spice.position.set(1.25, -0.65, 0.25);
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 32), material);
      sphere.position.set(1.65, 1.05, -0.2);

      shapes.push(torus, spice, sphere);
      scene.add(torus, spice, sphere);

      const light = new THREE.PointLight(0xffb15e, 2.4, 10);
      light.position.set(2.4, 2.2, 3.5);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0xffead4, 0.8));
    }

    const pointer = { x: 0, y: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = parent.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };

    const resize = () => {
      const width = Math.max(parent.clientWidth, 1);
      const height = Math.max(parent.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    parent.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', resize);
    resize();

    let frameId = 0;
    const render = () => {
      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.00025;
      particles.position.x += (pointer.x * 0.18 - particles.position.x) * 0.035;
      particles.position.y += (-pointer.y * 0.14 - particles.position.y) * 0.035;

      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.008 + index * 0.002;
        shape.rotation.y += 0.01 + index * 0.001;
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.0008;
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      parent.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resize);
      particleGeometry.dispose();
      particleMaterial.dispose();
      shapes.forEach((shape) => {
        shape.geometry.dispose();
        if (Array.isArray(shape.material)) {
          shape.material.forEach((material) => material.dispose());
        } else {
          shape.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
};

export default ParticleCanvas;
