import { SensorReading, PlantProfile, HealthScore } from '../types';

export class AnalyticsService {
  calculateHealthScore(reading: SensorReading, plant: PlantProfile): HealthScore {
    const factors = {
      moisture: this.calculateFactorScore(
        reading.soilMoisture,
        plant.optimalRanges.soilMoisture[0],
        plant.optimalRanges.soilMoisture[1]
      ),
      temperature: this.calculateFactorScore(
        reading.temperature,
        plant.optimalRanges.temperature[0],
        plant.optimalRanges.temperature[1]
      ),
      light: this.calculateFactorScore(
        reading.lightLevel,
        plant.optimalRanges.lightLevel[0],
        plant.optimalRanges.lightLevel[1]
      ),
      ph: this.calculateFactorScore(
        reading.ph,
        plant.optimalRanges.ph[0],
        plant.optimalRanges.ph[1]
      )
    };

    const overall = Math.round(
      (factors.moisture * 0.4 + factors.temperature * 0.3 + 
       factors.light * 0.2 + factors.ph * 0.1)
    );

    const recommendations = this.generateRecommendations(factors, reading, plant);

    return {
      overall,
      factors,
      recommendations
    };
  }

  private calculateFactorScore(value: number, min: number, max: number): number {
    if (value >= min && value <= max) {
      return 100;
    } else if (value < min) {
      const deviation = (min - value) / min;
      return Math.max(0, 100 - (deviation * 100));
    } else {
      const deviation = (value - max) / max;
      return Math.max(0, 100 - (deviation * 100));
    }
  }

  private generateRecommendations(factors: any, reading: SensorReading, plant: PlantProfile): string[] {
    const recommendations: string[] = [];

    if (factors.moisture < 70) {
      if (reading.soilMoisture < plant.optimalRanges.soilMoisture[0]) {
        recommendations.push("Water your plant - soil moisture is below optimal range");
      } else {
        recommendations.push("Monitor soil moisture closely - approaching dry conditions");
      }
    }

    if (factors.temperature < 70) {
      if (reading.temperature > plant.optimalRanges.temperature[1]) {
        recommendations.push("Move plant to cooler location or increase ventilation");
      } else {
        recommendations.push("Consider moving plant to warmer location");
      }
    }

    if (factors.light < 70) {
      recommendations.push("Increase light exposure - consider moving closer to window");
    }

    if (factors.ph < 70) {
      recommendations.push("Check soil pH levels - may need soil amendment");
    }

    if (recommendations.length === 0) {
      recommendations.push("Plant conditions are optimal - continue current care routine");
    }

    return recommendations;
  }

  getTrendAnalysis(readings: SensorReading[]): any {
    if (readings.length < 2) return null;

    const latest = readings[readings.length - 1];
    const previous = readings[readings.length - 2];

    return {
      moistureTrend: this.getTrend(latest.soilMoisture, previous.soilMoisture),
      temperatureTrend: this.getTrend(latest.temperature, previous.temperature),
      lightTrend: this.getTrend(latest.lightLevel, previous.lightLevel),
      phTrend: this.getTrend(latest.ph, previous.ph)
    };
  }

  private getTrend(current: number, previous: number): string {
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }
}