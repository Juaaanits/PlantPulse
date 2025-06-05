// ===========================================
// routes/alertRoutes.ts
// ===========================================

import { Router, Request, Response } from 'express';
import { AlertService } from '../services/AlertService';

const router = Router();
const alertService = new AlertService();

// GET /api/alerts
router.get('/', (req: Request, res: Response) => {
  try {
    const plantId = req.query.plantId as string;
    const alerts = alertService.getActiveAlerts(plantId);
    
    res.json({
      alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts/:alertId/resolve
router.post('/:alertId/resolve', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const resolved = alertService.resolveAlert(alertId);
    
    if (!resolved) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    
    res.json({ message: 'Alert resolved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

export { router as alertRoutes };