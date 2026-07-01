import { Request, Response, NextFunction } from 'express';
import * as setService from '../services/setService.js';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await setService.getSets(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const set = await setService.getSetBySlug(req.params.slug);
    res.json(set);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const set = await setService.getSetById(req.params.id);
    res.json(set);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const set = await setService.createSet(req.body);
    res.status(201).json(set);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const set = await setService.updateSet(req.params.id, req.body);
    res.json(set);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await setService.deleteSet(req.params.id);
    res.json({ message: 'Set deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const bulkDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of IDs to delete' });
    }
    await setService.bulkDeleteSets(ids);
    res.json({ message: 'Sets deleted successfully' });
  } catch (error) {
    next(error);
  }
};
