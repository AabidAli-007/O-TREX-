import React, { useEffect } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const KeyboardController: React.FC = () => {
  const setKeyDown = useSimulationStore((state) => state.setKeyDown);
  const setKeyUp = useSimulationStore((state) => state.setKeyUp);
  const recenterVehicle = useSimulationStore((state) => state.recenterVehicle);
  const togglePod = useSimulationStore((state) => state.togglePod);
  const toggleModal = useSimulationStore((state) => state.toggleModal);
  const cycleCameraMode = useSimulationStore((state) => state.cycleCameraMode);
  const toggleControlMode = useSimulationStore((state) => state.toggleControlMode);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const activeModal = useSimulationStore((state) => state.activeModal);
  const clearEmergencyStop = useSimulationStore((state) => state.clearEmergencyStop);
  const vehicle = useSimulationStore((state) => state.vehicle);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs or select dropdowns
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const key = e.key.toLowerCase();

      // Continuous movement controls (WASD, Shift, Space)
      if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === 'shift' || key === ' ') {
        e.preventDefault();
        setKeyDown(e.key);
      } else if (key === 'x' || key === 'p') {
        e.preventDefault();
        if (!e.repeat) {
          setKeyDown('x');
        }
      } else if (key === 'c') {
        e.preventDefault();
        if (!e.repeat) {
          toggleModal('SIZE_CHARTER');
        }
      } else if (key === 'v') {
        e.preventDefault();
        if (!e.repeat) {
          cycleCameraMode();
        }
      } else if (key === 'm') {
        e.preventDefault();
        if (!e.repeat) {
          toggleControlMode();
        }
      } else if (key === 'r') {
        e.preventDefault();
        if (!e.repeat) {
          recenterVehicle();
        }
      } else if (key === 'escape') {
        if (activeModal) {
          closeModal();
        } else if (vehicle.emergencyStop) {
          clearEmergencyStop();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === 'shift' || key === ' ' || key === 'x' || key === 'p') {
        setKeyUp(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    setKeyDown,
    setKeyUp,
    recenterVehicle,
    togglePod,
    toggleModal,
    cycleCameraMode,
    toggleControlMode,
    activeModal,
    closeModal,
    vehicle.emergencyStop,
    clearEmergencyStop
  ]);

  return null;
};
