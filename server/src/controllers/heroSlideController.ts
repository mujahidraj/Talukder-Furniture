import { Request, Response } from 'express';
import { heroSlideService } from '../services/heroSlideService.js';
import fs from 'fs';
import path from 'path';

export const heroSlideController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const activeOnly = req.query.active === 'true';
      const slides = activeOnly 
        ? await heroSlideService.getActive()
        : await heroSlideService.getAll();
      res.json(slides);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch hero slides' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const slide = await heroSlideService.getById(Number(req.params.id));
      if (!slide) {
        return res.status(404).json({ error: 'Hero slide not found' });
      }
      res.json(slide);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch hero slide' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      // Validate
      const { title, subtitle, ctaText, ctaLink, order, isActive } = req.body;
      
      let imageUrl = req.body.imageUrl;
      
      // If an image was uploaded, construct its URL
      if (req.file) {
        imageUrl = `/uploads/slides/${req.file.filename}`;
      }

      if (!imageUrl) {
        return res.status(400).json({ error: 'Image is required for hero slide' });
      }

      const slide = await heroSlideService.create({
        imageUrl,
        title,
        subtitle,
        ctaText,
        ctaLink,
        order: order ? Number(order) : undefined,
        isActive: isActive !== undefined ? String(isActive) === 'true' : undefined,
      });

      res.status(201).json(slide);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create hero slide' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { title, subtitle, ctaText, ctaLink, order, isActive } = req.body;
      let imageUrl = req.body.imageUrl;

      if (req.file) {
        imageUrl = `/uploads/slides/${req.file.filename}`;
        
        // delete old image if replaced
        const oldSlide = await heroSlideService.getById(Number(req.params.id));
        if (oldSlide && oldSlide.imageUrl.startsWith('/uploads/')) {
          const oldPath = path.join(process.cwd(), oldSlide.imageUrl);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) {}
          }
        }
      }

      const slide = await heroSlideService.update(Number(req.params.id), {
        ...(imageUrl && { imageUrl }),
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(ctaText !== undefined && { ctaText }),
        ...(ctaLink !== undefined && { ctaLink }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive: String(isActive) === 'true' }),
      });

      res.json(slide);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update hero slide' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await heroSlideService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete hero slide' });
    }
  },
};
