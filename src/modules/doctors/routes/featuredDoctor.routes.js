
import express from 'express';

import {
  createFeaturedDoctor,
  getFeaturedDoctors,
  deleteFeaturedDoctor,
  syncFeaturedDoctors,
} from '../controllers/featuredDoctor.controller.js';

import validate from '../../../middlewares/validate.js';

import {
  createFeaturedDoctorValidator,
  syncFeaturedDoctorsValidator,
} from '../validators/featuredDoctor.validators.js';

const router = express.Router();

router.get('/', getFeaturedDoctors);

const syncHandlers = [
  validate(syncFeaturedDoctorsValidator),
  syncFeaturedDoctors,
];

router.post('/sync', ...syncHandlers);
router.put('/', ...syncHandlers);

router.post(
  '/',
  validate(createFeaturedDoctorValidator),
  createFeaturedDoctor,
);

router.delete('/:id', deleteFeaturedDoctor);

export default router;
