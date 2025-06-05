import { Alert, SensorReading, PlantProfile } from '../types';
import { SensorService } from './SensorService';

export class AlertService {
  private alerts: Alert[] = [];
  private sensorService = new SensorService();

  checkAlerts(reading: SensorReading): Alert[] {
    const plant = this.sensorService.getPlantProfile(reading.plantId);
    if (!plant) return [];

    const newAlerts: Alert[] = [];

    // Soil moisture alerts
    if (reading.soilMoisture < plant.optimalRanges.soilMoisture[0]) {
      newAlerts.push(this.createAlert(
        reading.plantId,
        'critical',
        `${plant.name} needs watering - soil moisture at ${reading.soilMoisture}%`,
        3
      ));
    } else if (reading.soilMoisture > plant.optimalRanges.soilMoisture[1]) {
      newAlerts.push(this.createAlert(
        reading.plantId,
        'warning',
        `${plant.name} may be overwatered - soil moisture at ${reading.soilMoisture}%`,
        2
      ));
    }

    // Temperature alerts
    if (reading.temperature > plant.optimalRanges.temperature[1]) {
      newAlerts.push(this.createAlert(
        reading.plantId,
        'warning',
        `High temperature detected for ${plant.name} - ${reading.temperature}°C`,
        2
      ));
    } else if (reading.temperature < plant.optimalRanges.temperature[0]) {
      newAlerts.push(this.createAlert(
        reading.plantId,
        'warning',
        `Low temperature detected for ${plant.name} - ${reading.temperature}°C`,
        2
      ));
    }

    // Light level alerts
    if (reading.lightLevel < plant.optimalRanges.lightLevel[0]) {
      newAlerts.push(this.createAlert(
        reading.plantId,
        'info',
        `${plant.name} needs more light - current level ${reading.lightLevel} lux`,
        1
      ));
    }

    // Battery alerts
    if (reading.batteryLevel < 20) {
      newAlerts.push(this.createAlert(
        reading.plantId,
        'warning',
        `Low battery on ${plant.name} sensor - ${reading.batteryLevel}%`,
        2
      ));
    }

    // Store new alerts
    this.alerts.push(...newAlerts);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    return newAlerts;
  }

  private createAlert(plantId: string, type: Alert['type'], message: string, priority: number): Alert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      plantId,
      type,
      message,
      timestamp: new Date(),
      resolved: false,
      priority
    };
  }

  getActiveAlerts(plantId?: string): Alert[] {
    let filteredAlerts = this.alerts.filter(a => !a.resolved);
    
    if (plantId) {
      filteredAlerts = filteredAlerts.filter(a => a.plantId === plantId);
    }
    
    return filteredAlerts.sort((a, b) => b.priority - a.priority);
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }
}