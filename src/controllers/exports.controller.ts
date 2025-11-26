import { Request, Response, NextFunction } from 'express';
import { ExportsService } from '../services/exports.service';
import { successResponse } from '../utils/response';
import * as fs from 'fs';
import * as path from 'path';

const exportsService = new ExportsService();

/**
 * @route   POST /api/exports/csv
 * @desc    Export data to CSV
 * @access  Private
 */
export const exportToCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dataSource, startDate, endDate, filters } = req.body;
    const filePath = await exportsService.exportToCSV(
      dataSource,
      startDate,
      endDate,
      filters
    );

    // Send file download
    const filename = path.basename(filePath);
    res.download(filePath, filename, (err) => {
      if (err) {
        next(err);
      } else {
        // Clean up file after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 60000); // Delete after 1 minute
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/exports/excel
 * @desc    Export data to Excel
 * @access  Private
 */
export const exportToExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reportType, startDate, endDate, filters } = req.body;
    const filePath = await exportsService.exportToExcel(
      reportType,
      startDate,
      endDate,
      filters
    );

    // Send file download
    const filename = path.basename(filePath);
    res.download(filePath, filename, (err) => {
      if (err) {
        next(err);
      } else {
        // Clean up file after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 60000); // Delete after 1 minute
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/exports/batch
 * @desc    Batch export multiple data sources
 * @access  Private
 */
export const batchExport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dataSources, format = 'csv', startDate, endDate } = req.body;
    const filePaths = await exportsService.batchExport(
      dataSources,
      format,
      startDate,
      endDate
    );

    successResponse(
      res,
      {
        count: filePaths.length,
        files: filePaths.map((fp) => path.basename(fp)),
      },
      'Batch export completed successfully'
    );

    // Clean up files after some time
    setTimeout(() => {
      filePaths.forEach((fp) => {
        if (fs.existsSync(fp)) {
          fs.unlinkSync(fp);
        }
      });
    }, 300000); // Delete after 5 minutes
  } catch (error) {
    next(error);
  }
};
