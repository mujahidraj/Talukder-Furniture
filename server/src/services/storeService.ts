import prisma from '../config/db.js';
import { deleteFilesByUrls } from '../utils/fileCleaner.js';

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
  if (data.imageUrl !== undefined) {
    const oldStore = await prisma.store.findUnique({ where: { id } });
    if (oldStore && oldStore.imageUrl && oldStore.imageUrl !== data.imageUrl) {
      await deleteFilesByUrls([oldStore.imageUrl]);
    }
  }

  return prisma.store.update({
    where: { id },
    data,
  });
};

export const deleteStore = async (id: number) => {
  const store = await prisma.store.findUnique({ where: { id } });
  if (store && store.imageUrl) {
    await deleteFilesByUrls([store.imageUrl]);
  }

  return prisma.store.delete({
    where: { id },
  });
};
