// routes/sensorRoutes.ts
import { Router, Request, Response } from 'express';
import { SensorService } from '../services/SensorService';
import { AnalyticsService } from '../services/AnalyticsService';

const router = Router();
const sensorService = new SensorService();
const analyticsService = new AnalyticsService();

// GET /api/sensors/current/:plantId
router.get('/current/:plantId', (req: Request, res: Response): void => {
  try {
    const { plantId } = req.params;
    const reading = sensorService.getLatestReading(plantId);
    
    if (!reading) {
      res.status(404).json({ error: 'No sensor data found for this plant' });
      return;
    }
    
    res.json(reading);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

// GET /api/sensors/history/:plantId
router.get('/history/:plantId', (req, res) => {
  try {
    const { plantId } = req.params;
    const hours = parseInt(req.query.hours as string) || 24;
    
    const readings = sensorService.getHistoricalData(plantId, hours);
    const trends = analyticsService.getTrendAnalysis(readings);
    
    res.json({
      readings,
      trends,
      count: readings.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// GET /api/sensors/health/:plantId
router.get('/health/:plantId', (req: Request, res: Response): void => {
  try {
    const { plantId } = req.params;
    const reading = sensorService.getLatestReading(plantId);
    const plant = sensorService.getPlantProfile(plantId);
    
    if (!reading || !plant) {
      res.status(404).json({ error: 'Plant or sensor data not found' });
      return;
    }
    
    const healthScore = analyticsService.calculateHealthScore(reading, plant);
    
    res.json({
      plantId,
      plantName: plant.name,
      healthScore,
      lastUpdated: reading.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate health score' });
  }
});

// POST /api/sensors/reading
router.post('/reading', (req: Request, res: Response): void => {
  try {
    const { plantId, soilMoisture, temperature, lightLevel, ph, humidity } = req.body;
    
    // Validate required fields
    if (!plantId || soilMoisture === undefined || temperature === undefined) {
      res.status(400).json({ error: 'Missing required sensor data' });
      return;
    }
    
    // In a real implementation, you'd save this to a database
    const reading = {
      id: `reading-${Date.now()}`,
      plantId,
      timestamp: new Date(),
      soilMoisture,
      temperature,
      lightLevel: lightLevel || 0,
      ph: ph || 7.0,
      humidity: humidity || 50,
      batteryLevel: 100
    };
    
    res.status(201).json({
      message: 'Sensor reading recorded successfully',
      reading
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record sensor reading' });
  }
});

export { router as sensorRoutes };