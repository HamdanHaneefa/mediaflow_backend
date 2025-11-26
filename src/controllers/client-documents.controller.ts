import { Request, Response, NextFunction } from 'express';
import clientDocumentsService from '../services/client-documents.service';
import { sendSuccess } from '../utils/response';

/**
 * Get documents for authenticated client
 */
export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = req.user!.contact_id;
    const { page, limit, type, project_id } = req.query;

    const result = await clientDocumentsService.getDocuments(
      contactId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20,
      type as string | undefined,
      project_id as string | undefined
    );

    sendSuccess(res, result, 'Documents retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get document by ID
 */
export const getDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = req.user!.contact_id;
    const { documentId } = req.params;

    const document = await clientDocumentsService.getDocumentById(
      documentId,
      contactId
    );

    sendSuccess(res, document, 'Document retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = req.user!.contact_id;
    const { documentId } = req.params;

    const result = await clientDocumentsService.deleteDocument(
      documentId,
      contactId
    );

    sendSuccess(res, result, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get document types/categories
 */
export const getDocumentTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = req.user!.contact_id;

    const types = await clientDocumentsService.getDocumentTypes(contactId);

    sendSuccess(res, { types }, 'Document types retrieved successfully');
  } catch (error) {
    next(error);
  }
};
