// ===========================================
// middleware/validation.ts
// ===========================================

import { Request, Response, NextFunction } from 'express';

export const validateSensorData = (req: Request, res: Response, next: NextFunction) => {
  const { soilMoisture, temperature, lightLevel, ph } = req.body;
  
  const errors: string[] = [];
  
  if (soilMoisture !== undefined && (soilMoisture < 0 || soilMoisture > 100)) {
    errors.push('Soil moisture must be between 0 and 100');
  }
  
  if (temperature !== undefined && (temperature < -20 || temperature > 60)) {
    errors.push('Temperature must be between -20 and 60 degrees Celsius');
  }
  
  if (lightLevel !== undefined && (lightLevel < 0 || lightLevel > 2000)) {
    errors.push('Light level must be between 0 and 2000 lux');
  }
  
  if (ph !== undefined && (ph < 0 || ph > 14)) {
    errors.push('pH must be between 0 and 14');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  
  next();
};

export const validatePlantProfile = (req: Request, res: Response, next: NextFunction) => {
  const { name, species } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Valid plant name is required' });
  }
  
  if (!species || typeof species !== 'string' || species.trim().length === 0) {
    return res.status(400).json({ error: 'Valid plant species is required' });
  }
  
  next();
};