const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jobController = require('../controllers/job.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

router.get('/', jobController.getAllJobs);
router.get('/my-jobs', authMiddleware, checkRole(['employer']), jobController.getEmployerJobs);
router.get('/:id', jobController.getJobById);

router.post('/', [
  authMiddleware,
  checkRole(['employer']),
  body('title').notEmpty().withMessage('Title is required'),
  body('company').notEmpty().withMessage('Company is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('requirements').notEmpty().withMessage('Requirements are required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('type').isIn(['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship']).withMessage('Invalid job type'),
  body('category').notEmpty().withMessage('Category is required'),
  body('experienceLevel').isIn(['Entry', 'Intermediate', 'Senior', 'Lead']).withMessage('Invalid experience level')
], jobController.createJob);

router.put('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);

module.exports = router;
