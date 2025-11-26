import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response';
import { getFileUrl } from '../middleware/upload.middleware';
import { BadRequestError } from '../utils/errors';
import path from 'path';

export class UploadController {
  async uploadSingle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      const fileType = req.body.type || 'temp';
      const fileUrl = getFileUrl(req.file.filename, fileType);

      return successResponse(
        res,
        {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
          path: req.file.path,
        },
        'File uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new BadRequestError('No files uploaded');
      }

      const fileType = req.body.type || 'temp';
      const files = req.files.map((file: Express.Multer.File) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: getFileUrl(file.filename, fileType),
        path: file.path,
      }));

      return successResponse(
        res,
        { files, count: files.length },
        `${files.length} file(s) uploaded successfully`,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No image uploaded');
      }

      const fileUrl = getFileUrl(req.file.filename, 'images');

      return successResponse(
        res,
        {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
        'Image uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No document uploaded');
      }

      const fileUrl = getFileUrl(req.file.filename, 'documents');

      return successResponse(
        res,
        {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
        'Document uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadVideo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No video uploaded');
      }

      const fileUrl = getFileUrl(req.file.filename, 'videos');

      return successResponse(
        res,
        {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
        'Video uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No avatar uploaded');
      }

      const fileUrl = getFileUrl(req.file.filename, 'avatars');

      return successResponse(
        res,
        {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
        'Avatar uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No receipt uploaded');
      }

      const fileUrl = getFileUrl(req.file.filename, 'receipts');

      return successResponse(
        res,
        {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
        'Receipt uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
