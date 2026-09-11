import React, { useEffect } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const SimLoopController: React.FC = () => {
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaSec = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Advance deterministic physics and simulation state
      useSimulationStore.getState().tick(deltaSec);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return null;
};
