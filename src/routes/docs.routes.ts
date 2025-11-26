import express from 'express';
import path from 'path';

const router = express.Router();

/**
 * @route   GET /api/docs
 * @desc    Serve API documentation page (Swagger UI)
 * @access  Public
 */
router.get('/', (_req, res) => {
  const docsPath = path.join(__dirname, '../views/swagger-ui.html');
  res.sendFile(docsPath);
});

/**
 * @route   GET /api/docs/openapi.json
 * @desc    Serve OpenAPI specification
 * @access  Public
 */
router.get('/openapi.json', (_req, res) => {
  const openapiPath = path.join(__dirname, '../views/openapi.json');
  res.sendFile(openapiPath);
});

export default router;
