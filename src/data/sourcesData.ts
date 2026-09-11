export interface SourceItem {
  id: string;
  title: string;
  organization: string;
  url: string;
  category: 'GOVERNMENT_INSTITUTE' | 'ACADEMIC_PROGRAM' | 'HARDWARE_MANUFACTURER' | 'PEER_REVIEWED';
  keyClaimOrData: string;
  provenanceType: 'VERIFIED_PUBLIC_DATA' | 'PROJECT_DESIGN_SPEC' | 'ENGINEERING_ESTIMATE';
}

export const SOURCES_AND_REFERENCES: SourceItem[] = [
  {
    id: 'src-argo',
    title: 'Argo Program Frequently Asked Questions & Operational Costs',
    organization: 'Argo International Program / Scripps Institution of Oceanography (UCSD)',
    url: 'https://argo.ucsd.edu/faq/',
    category: 'ACADEMIC_PROGRAM',
    keyClaimOrData: 'Float hardware cost ~$20,000; total lifecycle approximately doubles with deployment, data handling, and satellite comms.',
    provenanceType: 'VERIFIED_PUBLIC_DATA'
  },
  {
    id: 'src-noaa-ioos',
    title: 'Oceanographic Ship Operation & Automated Observation Analysis',
    organization: 'National Oceanic and Atmospheric Administration (NOAA) / IOOS',
    url: 'https://ioos.noaa.gov/project/internet-of-things-in-the-deep-automating-the-collection-of-oceanographic-data-with-smarter-fishing-vessels/',
    category: 'GOVERNMENT_INSTITUTE',
    keyClaimOrData: 'Research vessel operations cost ~$25,000–$50,000/day for specialized survey missions; Reuben Lasker marginal day rate benchmarked at $59,426.',
    provenanceType: 'VERIFIED_PUBLIC_DATA'
  },
  {
    id: 'src-holybro',
    title: 'Pixhawk 6C Flight Controller Hardware Specification & Pricing',
    organization: 'Holybro Robotics & PX4 Autopilot Consortium',
    url: 'https://holybro.com/products/pixhawk-6c',
    category: 'HARDWARE_MANUFACTURER',
    keyClaimOrData: 'Retail MSRP $165.99 for STM32H743 autopilot with dual IMU and CAN bus navigation interfaces.',
    provenanceType: 'VERIFIED_PUBLIC_DATA'
  },
  {
    id: 'src-rpi',
    title: 'Raspberry Pi 4 Model B Hardware Technical Documentation',
    organization: 'Raspberry Pi Foundation',
    url: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/',
    category: 'HARDWARE_MANUFACTURER',
    keyClaimOrData: 'Quad-core Cortex-A72 @ 1.5GHz, 8GB RAM, Gigabit Ethernet, Ubuntu Linux 22.04 LTS compatibility.',
    provenanceType: 'VERIFIED_PUBLIC_DATA'
  },
  {
    id: 'src-bluerobotics-thruster',
    title: 'T200 Brushless Marine Thruster Specifications & Performance Curves',
    organization: 'Blue Robotics Inc.',
    url: 'https://bluerobotics.com/store/thrusters/t100-t200-thrusters/t200-thruster-r2-rp/',
    category: 'HARDWARE_MANUFACTURER',
    keyClaimOrData: 'Retail price $199/unit; bollard thrust 5.25 kgf at 16V; saltwater corrosion resistant.',
    provenanceType: 'VERIFIED_PUBLIC_DATA'
  },
  {
    id: 'src-bluerobotics-bar30',
    title: 'Bar30 High-Resolution 300m Depth & Pressure Sensor',
    organization: 'Blue Robotics Inc.',
    url: 'https://bluerobotics.com/store/sensors-cameras/sensors/bar-depth-pressure-sensor/',
    category: 'HARDWARE_MANUFACTURER',
    keyClaimOrData: 'Retail price $85; 30 bar rating (300m depth); 0.2 dbar precision piezoresistive transducer.',
    provenanceType: 'VERIFIED_PUBLIC_DATA'
  },
  {
    id: 'src-atlas-scientific',
    title: 'EZO OEM Environmental Sensor Circuits and Probes',
    organization: 'Atlas Scientific Environmental Robotics',
    url: 'https://atlas-scientific.com/shop/',
    category: 'HARDWARE_MANUFACTURER',
    keyClaimOrData: 'Individual retail pricing for Optical DO ($195), Conductivity ($145), pH ($85), RTD Temp ($45).',
    provenanceType: 'VERIFIED_PUBLIC_DATA'
  },
  {
    id: 'src-saildrone',
    title: 'Saildrone Explorer Platform Overview & Autonomous USV Architecture',
    organization: 'Saildrone Inc.',
    url: 'https://www.saildrone.com/platform/explorer',
    category: 'ACADEMIC_PROGRAM',
    keyClaimOrData: 'Commercial data-as-a-service mission model; wind-propelled wing with solar avionics; planetary ocean observation.',
    provenanceType: 'VERIFIED_PUBLIC_DATA'
  },
  {
    id: 'src-niot-moes',
    title: 'Autonomous Ocean Observation Systems in Polar and Indian Seas',
    organization: 'National Institute of Ocean Technology (NIOT) & Ministry of Earth Sciences (MoES)',
    url: 'https://www.niot.res.in/',
    category: 'GOVERNMENT_INSTITUTE',
    keyClaimOrData: 'SIH26065 Problem Statement benchmark: low-cost indigenous platforms for polar and Southern Ocean data collection.',
    provenanceType: 'PROJECT_DESIGN_SPEC'
  },
  {
    id: 'src-whoi',
    title: 'Autonomous Ocean Sampling Networks & Event-Triggered Profiling',
    organization: 'Woods Hole Oceanographic Institution (WHOI)',
    url: 'https://www.whoi.edu/',
    category: 'ACADEMIC_PROGRAM',
    keyClaimOrData: 'Scientific foundations for targeted adaptive sampling vs uniform spatial grid observation in oceanography.',
    provenanceType: 'PROJECT_DESIGN_SPEC'
  }
];
