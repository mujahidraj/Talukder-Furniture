import prisma from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export const createLead = async (data) => {
  return prisma.contactLead.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      referenceNumber: data.referenceNumber,
      message: data.message,
      source: data.source || 'contact-form',
      category: data.category,
      status: 'new',
    },
  });
};

export const getLeads = async (query: any = {}) => {
  const { page = 1, limit = 20, status, source } = query;
  const parsedLimit = parseInt(limit, 10);
  const take = Math.min(Math.max(parsedLimit, 1), 100); // Max 100 per page to prevent DoS
  const skip = (parseInt(page, 10) - 1) * take;

  const where: any = {};
  if (status) where.status = status;
  if (source) where.source = source;

  const [leads, total] = await Promise.all([
    prisma.contactLead.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactLead.count({ where }),
  ]);

  return {
    leads,
    total,
    page: parseInt(page, 10),
    totalPages: Math.ceil(total / take),
  };
};

export const updateLeadStatus = async (id, status) => {
  const validStatuses = ['new', 'seen', 'replied', 'resolved'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  return prisma.contactLead.update({
    where: { id: parseInt(id, 10) },
    data: { status },
  });
};

export const deleteLead = async (id) => {
  return prisma.contactLead.delete({
    where: { id: parseInt(id, 10) },
  });
};
