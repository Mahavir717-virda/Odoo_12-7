import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from './auth.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const JWT_SECRET = process.env.JWT_SECRET || 'esg-jwt-secret-key-12345';
const JWT_EXPIRES_IN = '7d';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export class AuthController {
  signup = asyncHandler(async (req, res) => {
    const { name, email, password, role = 'Employee', department = 'All' } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Name, email, and password are required');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'User with this email already exists');
    }

    const hashedPassword = hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      department,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            xp: user.xp,
            points: user.points,
            department: user.department,
          },
        },
        'User registered successfully'
      )
    );
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            xp: user.xp,
            points: user.points,
            department: user.department,
          },
        },
        'User logged in successfully'
      )
    );
  });

  getMe = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, user, 'User profile retrieved successfully')
    );
  });
}
