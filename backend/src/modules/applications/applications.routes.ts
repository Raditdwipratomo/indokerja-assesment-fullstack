import { Router } from 'express';
import { ApplicationsController } from './applications.controller';
import { validate } from '../../middleware/validate';
import { applySchema, updateStatusSchema } from './applications.schema';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();
router.post('/', auth, authorize(Role.JOB_SEEKER), validate(applySchema), ApplicationsController.apply);
router.get('/me', auth, authorize(Role.JOB_SEEKER), ApplicationsController.getMyApplications);
router.patch('/:id/status', auth, authorize(Role.COMPANY), validate(updateStatusSchema), ApplicationsController.updateStatus);
router.get('/:id/history', auth, ApplicationsController.getHistory);

export default router;
