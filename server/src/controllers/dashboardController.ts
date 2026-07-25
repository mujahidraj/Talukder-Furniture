import * as dashboardService from '../services/dashboardService.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getIncompleteProducts = async (req, res, next) => {
  try {
    const result = await dashboardService.getIncompleteProducts();
    res.json(result);
  } catch (error) {
    next(error);
  }
};
