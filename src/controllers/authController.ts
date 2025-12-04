import { Response, NextFunction } from 'express';
import { z } from 'zod';
import User from '../models/User';
import { signToken } from '../utils/jwt';
import { AppErrorClass } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['staff', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const signup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate input
    const validatedData = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new AppErrorClass('User with this email already exists', 400);
    }

    // Create new user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: validatedData.role || 'staff',
    });

    // Generate JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Send token in cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Remove password from output
    user.password = undefined as unknown as string;

    res.status(201).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return next(new AppErrorClass(errorMessages.join(', '), 400));
    }
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Check if user exists and password is correct
    const user = await User.findOne({ email: validatedData.email }).select('+password');
    if (!user || !(await user.comparePassword(validatedData.password))) {
      throw new AppErrorClass('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Send token in cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Remove password from output
    user.password = undefined as unknown as string;

    res.status(200).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return next(new AppErrorClass(errorMessages.join(', '), 400));
    }
    next(error);
  }
};

export const logout = async (_req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const updatePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate input
    const validatedData = updatePasswordSchema.parse(req.body);

    if (!req.user) {
      throw new AppErrorClass('You are not logged in', 401);
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw new AppErrorClass('User not found', 404);
    }

    // Check if current password is correct
    if (!(await user.comparePassword(validatedData.currentPassword))) {
      throw new AppErrorClass('Current password is incorrect', 401);
    }

    // Update password
    user.password = validatedData.newPassword;
    await user.save();

    // Generate new JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Send new token in cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Remove password from output
    user.password = undefined as unknown as string;

    res.status(200).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return next(new AppErrorClass(errorMessages.join(', '), 400));
    }
    next(error);
  }
};
