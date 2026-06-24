import * as faqService from '../services/faqService.js';

export const getAll = async (req: any, res: any, next: any) => {
  try {
    const faqs = await faqService.getAllFaqs();
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: any, res: any, next: any) => {
  try {
    const faq = await faqService.getFaqById(parseInt(req.params.id, 10));
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.json(faq);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: any, res: any, next: any) => {
  try {
    const faq = await faqService.createFaq(req.body);
    res.status(201).json(faq);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: any, res: any, next: any) => {
  try {
    const faq = await faqService.updateFaq(parseInt(req.params.id, 10), req.body);
    res.json(faq);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: any, res: any, next: any) => {
  try {
    await faqService.deleteFaq(parseInt(req.params.id, 10));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
