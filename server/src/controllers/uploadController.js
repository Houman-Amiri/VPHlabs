const mediaRepository = require('../repositories/mediaRepository');
const { persistUploadedFile } = require('../middlewares/upload');
const { asyncHandler } = require('../middlewares/errorHandler');

const uploadController = {
  uploadImage: asyncHandler(async (req, res) => {
    const stored = await persistUploadedFile(req.file);

    const record = mediaRepository.create({
      original_name: req.file.originalname,
      stored_name: stored.stored_name,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      storage_driver: stored.storage_driver,
      public_url: stored.public_url,
      uploaded_by: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      data: record,
    });
  }),

  listRecent: asyncHandler(async (_req, res) => {
    const items = mediaRepository.findRecent(30);
    res.status(200).json({
      success: true,
      data: items,
    });
  }),
};

module.exports = uploadController;
