import prisma from '../config/db.js';

export const getAllJobs = async () => {
  return prisma.jobPost.findMany({
    orderBy: { postedAt: 'desc' },
  });
};

export const getJobById = async (id: number) => {
  return prisma.jobPost.findUnique({
    where: { id },
  });
};

export const createJob = async (data: any) => {
  return prisma.jobPost.create({
    data,
  });
};

export const updateJob = async (id: number, data: any) => {
  return prisma.jobPost.update({
    where: { id },
    data,
  });
};

export const deleteJob = async (id: number) => {
  return prisma.jobPost.delete({
    where: { id },
  });
};
