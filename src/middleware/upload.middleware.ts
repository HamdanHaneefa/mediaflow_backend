import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { BadRequestError } from '../utils/errors';

// Ensure upload directories exist
const uploadDirs = {
  images: path.join(__dirname, '../../uploads/images'),
  documents: path.join(__dirname, '../../uploads/documents'),
  videos: path.join(__dirname, '../../uploads/videos'),
  receipts: path.join(__dirname, '../../uploads/receipts'),
  avatars: path.join(__dirname, '../../uploads/avatars'),
  temp: path.join(__dirname, '../../uploads/temp'),
};

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter for images
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter for documents
const documentFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only document files are allowed (pdf, doc, xls, ppt, txt, csv)'));
  }
};

// File filter for videos
const videoFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /video/.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only video files are allowed'));
  }
};

// Generate unique filename
const generateFilename = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname);
  return `${timestamp}-${randomString}${ext}`;
};

// Storage configuration
const createStorage = (destination: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      cb(null, generateFilename(file.originalname));
    },
  });
};

// Upload configurations
export const uploadImage = multer({
  storage: createStorage(uploadDirs.images),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadDocument = multer({
  storage: createStorage(uploadDirs.documents),
  fileFilter: documentFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export const uploadVideo = multer({
  storage: createStorage(uploadDirs.videos),
  fileFilter: videoFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

export const uploadReceipt = multer({
  storage: createStorage(uploadDirs.receipts),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadAvatar = multer({
  storage: createStorage(uploadDirs.avatars),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Generic upload
export const uploadAny = multer({
  storage: createStorage(uploadDirs.temp),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Utility function to delete file
export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Get file URL
export const getFileUrl = (filename: string, type: string): string => {
  return `/uploads/${type}/${filename}`;
};
