import * as leadService from '../services/leadService.js';
import { sendLeadNotification } from '../services/emailService.js';
import * as productService from '../services/productService.js';

export const submit = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(req.body);
    
    // If this is a product enquiry, increment the product's enquiryCount
    if (req.body.source === 'product-enquiry' && req.body.referenceNumber) {
      productService.incrementEnquiryCount(req.body.referenceNumber).catch(console.error);
    }
    
    // Send email notification without blocking the response
    sendLeadNotification(req.body).catch(console.error);
    
    res.status(201).json({ message: 'Request submitted successfully.', id: lead.id });
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await leadService.getLeads(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const lead = await leadService.updateLeadStatus(req.params.id, status);
    res.json(lead);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await leadService.deleteLead(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};
