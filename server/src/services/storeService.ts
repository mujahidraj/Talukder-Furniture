import prisma from '../config/db.js';

export const getAllStores = async () => {
  return prisma.store.findMany({
    orderBy: { order: 'asc' },
  });
};

export const getStoreById = async (id: number) => {
  return prisma.store.findUnique({
    where: { id },
  });
};

export const createStore = async (data: any) => {
  return prisma.store.create({
    data,
  });
};

export const updateStore = async (id: number, data: any) => {
  return prisma.store.update({
    where: { id },
    data,
  });
};

export const deleteStore = async (id: number) => {
  return prisma.store.delete({
    where: { id },
  });
};
