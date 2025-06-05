// ===========================================
// routes/plantRoutes.ts
// ===========================================

import { Router, Request, Response } from 'express';
import { SensorService } from '../services/SensorService';

const router = Router();
const sensorService = new SensorService();

// GET /api/plants/:plantId
router.get('/:plantId', (req: Request, res: Response): void => {
  try {
    const { plantId } = req.params;
    const plant = sensorService.getPlantProfile(plantId);
    
    if (!plant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }
    
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plant profile' });
  }
});

// GET /api/plants
router.get('/', (req, res) => {
  try {
    const plants = sensorService.getAllPlants();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// POST /api/plants
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, species, location, optimalRanges } = req.body;
    
    if (!name || !species) {
      res.status(400).json({ error: 'Name and species are required' });
      return;
    }
    
    const newPlant = {
      id: `plant-${Date.now()}`,
      name,
      species,
      location: location || 'Unknown',
      plantedDate: new Date(),
      optimalRanges: optimalRanges || {
        soilMoisture: [40, 60],
        temperature: [18, 25],
        lightLevel: [200, 400],
        ph: [6.0, 7.0]
      }
    };
    
    res.status(201).json({
      message: 'Plant profile created successfully',
      plant: newPlant
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create plant profile' });
  }
});

// PUT /api/plants/:plantId
router.put('/:plantId', (req, res) => {
  try {
    const { plantId } = req.params;
    const updates = req.body;
    
    // In a real implementation, you'd update the database
    res.json({
      message: 'Plant profile updated successfully',
      plantId,
      updates
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update plant profile' });
  }
});

// POST /api/plants/:plantId/water
router.post('/:plantId/water', (req, res) => {
  try {
    const { plantId } = req.params;
    const { amount, notes } = req.body;
    
    const wateringRecord = {
      plantId,
      timestamp: new Date(),
      amount: amount || 'Not specified',
      notes: notes || 'Manual watering',
      recordedBy: 'user'
    };
    
    res.json({
      message: 'Watering recorded successfully',
      record: wateringRecord
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record watering' });
  }
});

export { router as plantRoutes };