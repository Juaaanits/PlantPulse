import { SensorReading, PlantProfile } from '../types';

export class SensorService {
  private readings: SensorReading[] = [];
  private plantProfiles: PlantProfile[] = [
    {
      id: 'plant-1',
      name: 'Monstera Deliciosa',
      species: 'Monstera deliciosa',
      optimalRanges: {
        soilMoisture: [40, 60],
        temperature: [18, 24],
        lightLevel: [200, 400],
        ph: [6.0, 7.0]
      },
      location: 'Living Room',
      plantedDate: new Date('2024-01-15')
    }
  ];

  generateRealtimeData(): SensorReading {
    const reading: SensorReading = {
      id: `reading-${Date.now()}`,
      plantId: 'plant-1',
      timestamp: new Date(),
      soilMoisture: this.simulateRealistic(45, 55, 5),
      temperature: this.simulateRealistic(20, 25, 2),
      lightLevel: this.simulateRealistic(250, 350, 50),
      ph: parseFloat(this.simulateRealistic(6.2, 6.8, 0.3).toFixed(1)),
      humidity: this.simulateRealistic(45, 65, 5),
      batteryLevel: Math.max(20, 100 - (this.readings.length * 0.1))
    };

    this.readings.push(reading);
    
    // Keep only last 100 readings
    if (this.readings.length > 100) {
      this.readings = this.readings.slice(-100);
    }

    return reading;
  }

  private simulateRealistic(min: number, max: number, variance: number): number {
    const base = (min + max) / 2;
    const randomVariation = (Math.random() - 0.5) * variance * 2;
    return Math.max(min, Math.min(max, base + randomVariation));
  }

  getHistoricalData(plantId: string, hours: number = 24): SensorReading[] {
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return this.readings.filter(r => 
      r.plantId === plantId && r.timestamp >= cutoff
    );
  }

  getLatestReading(plantId: string): SensorReading | null {
    const plantReadings = this.readings.filter(r => r.plantId === plantId);
    return plantReadings.length > 0 ? plantReadings[plantReadings.length - 1] : null;
  }

  getPlantProfile(plantId: string): PlantProfile | null {
    return this.plantProfiles.find(p => p.id === plantId) || null;
  }

  getAllPlants(): PlantProfile[] {
    return this.plantProfiles;
  }
}
