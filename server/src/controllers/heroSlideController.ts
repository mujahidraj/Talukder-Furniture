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
      
      let imageUrl = req.body.imageUrl || null;
      let videoUrl = req.body.videoUrl || null;
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      // If an image was uploaded, construct its URL
      if (files && files['image'] && files['image'].length > 0) {
        imageUrl = `/uploads/slides/${files['image'][0].filename}`;
      }

      // If a video was uploaded, construct its URL
      if (files && files['video'] && files['video'].length > 0) {
        videoUrl = `/uploads/slides/${files['video'][0].filename}`;
      }

      if (!imageUrl && !videoUrl) {
        return res.status(400).json({ error: 'At least one media file (image or video) is required for hero slide' });
      }

      const slide = await heroSlideService.create({
        imageUrl,
        videoUrl,
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
      let videoUrl = req.body.videoUrl;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const oldSlide = await heroSlideService.getById(Number(req.params.id));

      if (files && files['image'] && files['image'].length > 0) {
        imageUrl = `/uploads/slides/${files['image'][0].filename}`;
        
        // delete old image if replaced
        if (oldSlide && oldSlide.imageUrl && oldSlide.imageUrl.startsWith('/uploads/')) {
          const filename = path.basename(oldSlide.imageUrl);
          const oldPath = path.resolve(process.cwd(), 'uploads', 'slides', filename);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
          }
        }
      }

      if (files && files['video'] && files['video'].length > 0) {
        videoUrl = `/uploads/slides/${files['video'][0].filename}`;
        
        // delete old video if replaced
        if (oldSlide && oldSlide.videoUrl && oldSlide.videoUrl.startsWith('/uploads/')) {
          const filename = path.basename(oldSlide.videoUrl);
          const oldPath = path.resolve(process.cwd(), 'uploads', 'slides', filename);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
          }
        }
      }

      // If clearing video
      if (req.body.clearVideo === 'true') {
        videoUrl = null;
        if (oldSlide && oldSlide.videoUrl && oldSlide.videoUrl.startsWith('/uploads/')) {
          const filename = path.basename(oldSlide.videoUrl);
          const oldPath = path.resolve(process.cwd(), 'uploads', 'slides', filename);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
          }
        }
      }

      const updateData: any = {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(ctaText !== undefined && { ctaText }),
        ...(ctaLink !== undefined && { ctaLink }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive: String(isActive) === 'true' }),
      };

      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (videoUrl !== undefined || req.body.clearVideo === 'true') updateData.videoUrl = videoUrl;

      const slide = await heroSlideService.update(Number(req.params.id), updateData);

      res.json(slide);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update hero slide' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const oldSlide = await heroSlideService.getById(Number(req.params.id));
      if (oldSlide) {
        if (oldSlide.imageUrl && oldSlide.imageUrl.startsWith('/uploads/')) {
          const filename = path.basename(oldSlide.imageUrl);
          const oldPath = path.resolve(process.cwd(), 'uploads', 'slides', filename);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
          }
        }
        if (oldSlide.videoUrl && oldSlide.videoUrl.startsWith('/uploads/')) {
          const filename = path.basename(oldSlide.videoUrl);
          const oldPath = path.resolve(process.cwd(), 'uploads', 'slides', filename);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
          }
        }
      }
      await heroSlideService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete hero slide' });
    }
  },
};
