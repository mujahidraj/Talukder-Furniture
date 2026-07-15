import prisma from '../config/db.js';
import fs from 'fs';
import path from 'path';
import config from '../config/index.js';

export const heroSlideService = {
  getAll: async () => {
    return prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
    });
  },

  getActive: async () => {
    return prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  },

  getById: async (id: number) => {
    return prisma.heroSlide.findUnique({
      where: { id },
    });
  },

  create: async (data: {
    imageUrl?: string | null;
    videoUrl?: string | null;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    order?: number;
    isActive?: boolean;
  }) => {
    // Determine the next order if not provided
    if (data.order === undefined) {
      const maxOrderSlide = await prisma.heroSlide.findFirst({
        orderBy: { order: 'desc' },
      });
      data.order = maxOrderSlide ? maxOrderSlide.order + 1 : 0;
    }

    return prisma.heroSlide.create({
      data: {
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        title: data.title,
        subtitle: data.subtitle,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        order: data.order,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  },

  update: async (
    id: number,
    data: {
      imageUrl?: string | null;
      videoUrl?: string | null;
      title?: string;
      subtitle?: string;
      ctaText?: string;
      ctaLink?: string;
      order?: number;
      isActive?: boolean;
    }
  ) => {
    return prisma.heroSlide.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number) => {
    // Get the slide to delete its image if necessary
    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    if (slide && slide.imageUrl && slide.imageUrl.startsWith('/uploads/')) {
      // #18 Fix: Use path.basename to prevent path traversal from tampered DB values
      const filename = path.basename(slide.imageUrl);
      const filePath = path.resolve(config.upload.localPath, 'slides', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(`Failed to delete hero slide image: ${filePath}`, e);
        }
      }
    }
    
    if (slide && slide.videoUrl && slide.videoUrl.startsWith('/uploads/')) {
      // #18 Fix: Use path.basename to prevent path traversal
      const filename = path.basename(slide.videoUrl);
      const filePath = path.resolve(config.upload.localPath, 'slides', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(`Failed to delete hero slide video: ${filePath}`, e);
        }
      }
    }

    return prisma.heroSlide.delete({
      where: { id },
    });
  },
};
