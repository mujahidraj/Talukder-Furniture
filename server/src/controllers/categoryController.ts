import * as categoryService from '../services/categoryService.js';

export const getTree = async (req, res, next) => {
  try {
    const isAdmin = !!(req as any).admin && req.query.admin === 'true';
    const categories = await categoryService.getTree(isAdmin);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req, res, next) => {
  try {
    const isAdmin = !!(req as any).admin;
    const category = await categoryService.getCategoryBySlug(req.params.slug, isAdmin);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
