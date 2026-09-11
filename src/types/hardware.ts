import { ProvenanceType } from './simulation';

export interface HardwareSubsystem {
  id: string;
  name: string;
  category: 'AUTOPILOT' | 'COMPUTE' | 'POWER' | 'SENSORS' | 'COMMUNICATION' | 'MECHANICAL' | 'STRUCTURE';
  role: string;
  specs: string[];
  interfaceBus: string;
  powerRole: string;
  whyOtrexUsesIt: string;
  estCostUsd: number;
  estCostInr: number;
  provenanceType: ProvenanceType;
  sourceTitle: string;
  sourceUrl: string;
  realImageUrl: string;
  hotspot3D: [number, number, number]; // Position on vehicle mesh
  notes?: string;
}

export interface PodSensorInfo {
  id: string;
  name: string;
  measures: string;
  unit: string;
  range: string;
  accuracy: string;
  envMeaning: string;
  physicalPrinciple: string;
  approxCostUsd: number;
  approxCostInr: number;
  source: string;
  sourceUrl: string;
  provenanceType: ProvenanceType;
  realImageUrl: string;
}

export interface BOMItem {
  id: string;
  category: string;
  name: string;
  partNumberOrRef: string;
  quantity: number;
  unitCostUsd: number;
  provenanceType: ProvenanceType;
  sourceNote: string;
  sourceUrl: string;
  editable: boolean;
}
