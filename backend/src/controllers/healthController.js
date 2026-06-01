export const getHealth = (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SkyCastBD API',
    timestamp: new Date().toISOString()
  });
};
