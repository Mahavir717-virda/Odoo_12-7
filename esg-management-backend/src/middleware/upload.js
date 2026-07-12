import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../utils/constants.js';

// Setup file disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Setup file filter
const fileFilter = (req, file, cb) => {
  // Allow only images & documents (PDF, Excel, CSV)
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf', '.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid file type. Allowed formats: PNG, JPG, JPEG, PDF, XLSX, XLS, CSV'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
