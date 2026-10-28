const express = require('express');
const teamController = require('../controllers/teamController');
const {
  optionalAuth,
  requireAuth,
  requireRole,
} = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} = require('../validators/teamSchemas');

const router = express.Router();

router.get('/', optionalAuth, teamController.list);
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validateBody(createTeamMemberSchema),
  teamController.create
);
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validateBody(updateTeamMemberSchema),
  teamController.update
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  teamController.remove
);

router.routeMeta = [
  {
    method: 'GET',
    path: '/api/team',
    auth: 'Public (`?all=true` for Admin)',
    summary: 'List active team members / colleagues (همکاران) with LinkedIn & Instagram links.',
  },
  {
    method: 'POST',
    path: '/api/team',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: '{ full_name_fa, role_fa, bio_fa?, avatar_url?, linkedin_url?, instagram_url?, sort_order?, is_active? }',
    summary: 'Add a new colleague to the About Us page.',
  },
  {
    method: 'PUT',
    path: '/api/team/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: 'Partial team member fields',
    summary: 'Update colleague details, photo, or social links.',
  },
  {
    method: 'DELETE',
    path: '/api/team/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Remove a colleague entry.',
  },
];

module.exports = router;
