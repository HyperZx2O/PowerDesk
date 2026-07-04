const { Router } = require('express');
const { validateTimestamp } = require('../middleware/validation');
const { wrapResponse, wrapError } = require('../utils/response');

const router = Router();

router.get('/', (req, res) => {
  const alertEngine = req.app.locals.alertEngine;
  let alerts = alertEngine.getAlerts();

  if (req.query.since) {
    const error = validateTimestamp(req.query.since);
    if (error) {
      return res.status(400).json(wrapError('INVALID_TIMESTAMP', error));
    }
    const sinceMs = new Date(req.query.since).getTime();
    alerts = alerts.filter((a) => new Date(a.triggeredAt).getTime() >= sinceMs);
  }

  let limit = parseInt(req.query.limit, 10) || 20;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;
  alerts = alerts.slice(-limit);

  const activeCount = alerts.filter((a) => !a.resolvedAt).length;
  const resolvedCount = alerts.filter((a) => a.resolvedAt).length;

  res.json(wrapResponse({ alerts, activeCount, resolvedCount }));
});

module.exports = router;
