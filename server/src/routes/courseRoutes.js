const express = require('express');
const courseController = require('../controllers/courseController');
const { optionalAuth, requireAuth, requireRole } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const {
  createCourseSchema,
  updateCourseSchema,
} = require('../validators/courseSchemas');

const router = express.Router();

router.get('/', optionalAuth, courseController.list);
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validateBody(createCourseSchema),
  courseController.create
);
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validateBody(updateCourseSchema),
  courseController.update
);
router.delete('/:id', requireAuth, requireRole('admin'), courseController.remove);

router.routeMeta = [
  {
    method: 'GET',
    path: '/api/courses',
    auth: 'Public (`?all=true` unlocked for Admin)',
    summary: 'Lists training courses with syllabus items and in-person/online tags.',
  },
  {
    method: 'POST',
    path: '/api/courses',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Creates a new training course with syllabus and delivery mode tags.',
  },
  {
    method: 'PUT',
    path: '/api/courses/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Updates an existing training course.',
  },
  {
    method: 'DELETE',
    path: '/api/courses/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Deletes a training course by ID.',
  },
];

module.exports = router;
