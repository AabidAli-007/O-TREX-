import { CommunicationState, DataPacket } from '../../types/simulation';

export function createInitialCommunicationState(): CommunicationState {
  return {
    activeBearer: 'SATELLITE',
    linkQualityPct: 88,
    rssiDbm: -72,
    bandwidthKbps: 2.4, // Iridium SBD baseline
    queuedPacketsCount: 0,
    queuedBytes: 0,
    transmittedBytes: 12400,
    packets: [],
    satelliteAvailable: true,
    loraAvailable: false,
    cellularAvailable: false
  };
}

export function generatePriorityPacket(
  priority: DataPacket['priority'],
  type: string,
  payloadSummary: string,
  sizeBytes: number
): DataPacket {
  return {
    id: `pkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    priority,
    type,
    timestamp: Date.now(),
    sizeBytes,
    payloadSummary,
    status: 'QUEUED'
  };
}

export function processCommunicationQueue(
  state: CommunicationState,
  deltaSec: number,
  isOfflineForced: boolean
): {
  nextState: CommunicationState;
  transmittedPackets: DataPacket[];
  isTransmitting: boolean;
} {
  const isOffline = isOfflineForced || state.activeBearer === 'OFFLINE' || state.linkQualityPct <= 0;

  if (isOffline) {
    // Keep packets in queue, status STORED_LOCAL
    const packets = state.packets.map((p) =>
      p.status === 'QUEUED' ? { ...p, status: 'STORED_LOCAL' as const } : p
    );
    return {
      nextState: {
        ...state,
        activeBearer: 'OFFLINE',
        linkQualityPct: 0,
        bandwidthKbps: 0,
        queuedPacketsCount: packets.filter((p) => p.status !== 'SENT').length,
        queuedBytes: packets
          .filter((p) => p.status !== 'SENT')
          .reduce((sum, p) => sum + p.sizeBytes, 0),
        packets
      },
      transmittedPackets: [],
      isTransmitting: false
    };
  }

  // Active link: sort packets by Priority (P1 -> P2 -> P3 -> P4 -> P5)
  const priorityOrder: Record<DataPacket['priority'], number> = {
    P1_CRITICAL: 1,
    P2_HIGH: 2,
    P3_TELEMETRY: 3,
    P4_ROUTINE: 4,
    P5_LOGS: 5
  };

  const pendingPackets = state.packets
    .filter((p) => p.status !== 'SENT')
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  if (pendingPackets.length === 0) {
    return {
      nextState: {
        ...state,
        queuedPacketsCount: 0,
        queuedBytes: 0
      },
      transmittedPackets: [],
      isTransmitting: false
    };
  }

  // Calculate transmission capability in this step (bytes = (kbps * 1000 / 8) * deltaSec)
  const availableBytes = ((state.bandwidthKbps * 1000) / 8) * deltaSec;
  let transmittedBytesStep = 0;
  const transmittedThisStep: DataPacket[] = [];

  const updatedPackets = state.packets.map((pkt) => {
    if (pkt.status === 'SENT') return pkt;
    // Check if this pending packet can be transmitted
    if (transmittedBytesStep + pkt.sizeBytes <= availableBytes * 3.5) {
      // Small burst multiplier for simulation responsiveness
      transmittedBytesStep += pkt.sizeBytes;
      const sentPkt = { ...pkt, status: 'SENT' as const };
      transmittedThisStep.push(sentPkt);
      return sentPkt;
    }
    return pkt;
  });

  const remainingQueue = updatedPackets.filter((p) => p.status !== 'SENT');

  return {
    nextState: {
      ...state,
      queuedPacketsCount: remainingQueue.length,
      queuedBytes: remainingQueue.reduce((sum, p) => sum + p.sizeBytes, 0),
      transmittedBytes: state.transmittedBytes + transmittedBytesStep,
      packets: updatedPackets
    },
    transmittedPackets: transmittedThisStep,
    isTransmitting: transmittedThisStep.length > 0
  };
}
