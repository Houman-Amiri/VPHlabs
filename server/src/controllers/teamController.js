const teamRepository = require('../repositories/teamRepository');
const { AppError, asyncHandler } = require('../middlewares/errorHandler');

const teamController = {
  list: asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const activeOnly = !(isAdmin && req.query.all === 'true');
    const members = teamRepository.findAll({ activeOnly });

    res.status(200).json({
      success: true,
      data: members,
    });
  }),

  create: asyncHandler(async (req, res) => {
    const created = teamRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const updated = teamRepository.update(req.params.id, req.body);
    if (!updated) {
      throw new AppError('همکار مورد نظر یافت نشد.', 404, 'TEAM_MEMBER_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = teamRepository.remove(req.params.id);
    if (!deleted) {
      throw new AppError('همکار مورد نظر یافت نشد.', 404, 'TEAM_MEMBER_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { id: Number(req.params.id), deleted: true },
    });
  }),
};

module.exports = teamController;
