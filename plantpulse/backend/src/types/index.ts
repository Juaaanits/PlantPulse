export interface SensorReading {
  id: string;
  plantId: string;
  timestamp: Date;
  soilMoisture: number;
  temperature: number;
  lightLevel: number;
  ph: number;
  humidity: number;
  batteryLevel: number;
}

export interface PlantProfile {
  id: string;
  name: string;
  species: string;
  optimalRanges: {
    soilMoisture: [number, number];
    temperature: [number, number];
    lightLevel: [number, number];
    ph: [number, number];
  };
  location: string;
  plantedDate: Date;
  lastWatered?: Date;
}

export interface Alert {
  id: string;
  plantId: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
  priority: number;
}

export interface HealthScore {
  overall: number;
  factors: {
    moisture: number;
    temperature: number;
    light: number;
    ph: number;
  };
  recommendations: string[];
}