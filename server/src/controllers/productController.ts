import * as productService from '../services/productService.js';

export const list = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const search = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    const result = await productService.searchProducts(q, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const incrementView = async (req, res, next) => {
  try {
    await productService.incrementProductView(req.params.slug);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error); // Fails silently for views if needed, but passes to handler
  }
};

export const create = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of product IDs is required.' });
    }
    const result = await productService.bulkDeleteProducts(ids);
    res.json({ message: 'Products deleted successfully', count: result.count });
  } catch (error) {
    next(error);
  }
};
