import * as jobService from '../services/jobService.js';

export const getAll = async (req: any, res: any, next: any) => {
  try {
    const jobs = await jobService.getAllJobs();
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: any, res: any, next: any) => {
  try {
    const job = await jobService.getJobById(parseInt(req.params.id, 10));
    if (!job) return res.status(404).json({ error: 'Job post not found' });
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: any, res: any, next: any) => {
  try {
    const job = await jobService.createJob(req.body);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: any, res: any, next: any) => {
  try {
    const job = await jobService.updateJob(parseInt(req.params.id, 10), req.body);
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: any, res: any, next: any) => {
  try {
    await jobService.deleteJob(parseInt(req.params.id, 10));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
