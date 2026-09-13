import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { MissionDrawer } from './MissionDrawer';
import { VehicleDrawer } from './VehicleDrawer';
import { SensorsDrawer } from './SensorsDrawer';
import { PodDrawer } from './PodDrawer';
import { OceanDataDrawer } from './OceanDataDrawer';
import { MapDrawer } from './MapDrawer';
import { AnalyticsDrawer } from './AnalyticsDrawer';

export const SideDrawerContainer: React.FC = () => {
  const activeDrawer = useSimulationStore((state) => state.activeDrawer);

  if (!activeDrawer) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 z-25 flex pointer-events-auto animate-in slide-in-from-right duration-200 shadow-2xl">
      {activeDrawer === 'MISSION' && <MissionDrawer />}
      {activeDrawer === 'VEHICLE' && <VehicleDrawer />}
      {activeDrawer === 'OCEAN_DATA' && <OceanDataDrawer />}
      {activeDrawer === 'SENSORS' && <SensorsDrawer />}
      {activeDrawer === 'POD' && <PodDrawer />}
      {activeDrawer === 'MAP' && <MapDrawer />}
      {activeDrawer === 'ANALYTICS' && <AnalyticsDrawer />}
    </div>
  );
};
