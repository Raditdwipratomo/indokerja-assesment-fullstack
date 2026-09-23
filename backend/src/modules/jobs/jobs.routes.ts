import { Router } from 'express';
import { JobsController } from './jobs.controller';
import { validate } from '../../middleware/validate';
import { createJobSchema } from './jobs.schema';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', JobsController.list);
router.get('/my', auth, authorize(Role.COMPANY), JobsController.myJobs);
router.get('/:id', JobsController.getOne);
router.post('/', auth, authorize(Role.COMPANY), validate(createJobSchema), JobsController.create);

export default router;
