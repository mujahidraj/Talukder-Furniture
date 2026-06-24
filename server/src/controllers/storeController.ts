import * as storeService from '../services/storeService.js';

export const getAll = async (req: any, res: any, next: any) => {
  try {
    const stores = await storeService.getAllStores();
    res.json(stores);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: any, res: any, next: any) => {
  try {
    const store = await storeService.getStoreById(parseInt(req.params.id, 10));
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: any, res: any, next: any) => {
  try {
    const store = await storeService.createStore(req.body);
    res.status(201).json(store);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: any, res: any, next: any) => {
  try {
    const store = await storeService.updateStore(parseInt(req.params.id, 10), req.body);
    res.json(store);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: any, res: any, next: any) => {
  try {
    await storeService.deleteStore(parseInt(req.params.id, 10));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
