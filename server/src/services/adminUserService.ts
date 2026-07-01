import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import config from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAllAdmins = async () => {
  return await prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getAdminById = async (id: number) => {
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  return admin;
};

export const createAdmin = async (data: { name: string; email: string; password?: string; role: string }) => {
  const existing = await prisma.admin.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError('Email already in use', 400);
  }

  const password = data.password || 'Admin@123456';
  const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);

  const admin = await prisma.admin.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role ? data.role.toUpperCase() : 'ADMIN',
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    }
  });

  return admin;
};

export const updateAdmin = async (
  id: number, 
  data: { name?: string; email?: string; password?: string; role?: string; superAdminPassword?: string },
  currentAdminId: number
) => {
  if (!data.superAdminPassword) {
    throw new AppError('Super Admin password is required to save changes', 400);
  }

  const currentAdmin = await prisma.admin.findUnique({ where: { id: currentAdminId } });
  if (!currentAdmin) {
    throw new AppError('Current admin not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(data.superAdminPassword, currentAdmin.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid Super Admin password', 401);
  }

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  // Protect ENV seeded super admin
  if (admin.email === config.admin.seedEmail) {
    throw new AppError('Cannot modify the default Super Admin', 403);
  }

  const updateData: any = { ...data };

  if (data.email && data.email !== admin.email) {
    const existing = await prisma.admin.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email already in use', 400);
    }
  }

  if (updateData.role) {
    updateData.role = updateData.role.toUpperCase();
  }

  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, config.bcrypt.saltRounds);
  }
  delete updateData.password;
  delete updateData.superAdminPassword;

  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    }
  });

  return updatedAdmin;
};

export const deleteAdmin = async (id: number) => {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  // Protect ENV seeded super admin
  if (admin.email === config.admin.seedEmail) {
    throw new AppError('Cannot delete the default Super Admin', 403);
  }

  await prisma.admin.delete({ where: { id } });
  return { message: 'Admin deleted successfully' };
};
