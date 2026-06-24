import prisma from '../config/db.js';

export const getAllFaqs = async () => {
  return prisma.faqItem.findMany({
    orderBy: [
      { groupName: 'asc' },
      { order: 'asc' },
      { id: 'asc' }
    ]
  });
};

export const getFaqById = async (id: number) => {
  return prisma.faqItem.findUnique({
    where: { id },
  });
};

export const createFaq = async (data: any) => {
  return prisma.faqItem.create({
    data: {
      groupName: data.groupName,
      question: data.question,
      answer: data.answer,
      order: data.order ? parseInt(data.order, 10) : 0,
    }
  });
};

export const updateFaq = async (id: number, data: any) => {
  return prisma.faqItem.update({
    where: { id },
    data: {
      groupName: data.groupName,
      question: data.question,
      answer: data.answer,
      order: data.order ? parseInt(data.order, 10) : 0,
    }
  });
};

export const deleteFaq = async (id: number) => {
  return prisma.faqItem.delete({
    where: { id },
  });
};
