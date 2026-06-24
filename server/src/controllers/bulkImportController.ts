import * as bulkImportService from '../services/bulkImportService.js';

export const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload an .xlsx or .csv file.' });
    }

    const adminId = req.admin.id;
    const fileName = req.file.originalname;

    const result = await bulkImportService.processExcelFile(req.file.buffer, adminId, fileName);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const downloadTemplate = async (req, res, next) => {
  try {
    const buffer = bulkImportService.generateTemplate();

    res.setHeader('Content-Disposition', 'attachment; filename="Talukder_Furniture_Product_Template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
