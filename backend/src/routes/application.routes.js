const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/:jobId/apply', [
  authMiddleware,
  checkRole(['candidate']),
  upload.single('resume')
], applicationController.applyForJob);

router.get('/my-applications', authMiddleware, checkRole(['candidate']), applicationController.getApplications);
router.get('/job/:jobId', authMiddleware, checkRole(['employer']), applicationController.getJobApplications);
router.put('/:applicationId/status', authMiddleware, checkRole(['employer']), applicationController.updateApplicationStatus);

module.exports = router;
