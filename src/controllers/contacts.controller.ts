import { Request, Response, NextFunction } from 'express';
import contactsService from '../services/contacts.service';
import { successResponse } from '../utils/response';
import { CreateContactInput, UpdateContactInput } from '../validators/contacts.validator';

export class ContactsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateContactInput = req.body;
      const contact = await contactsService.createContact(data);
      
      return successResponse(res, contact, 'Contact created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contact = await contactsService.getContact(id);
      
      return successResponse(res, contact, 'Contact retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page,
        limit,
        search,
        role,
        status,
        sortBy,
        sortOrder,
      } = req.query;

      const contacts = await contactsService.listContacts({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        role: role as string,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      return successResponse(res, contacts, 'Contacts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateContactInput = req.body;
      const contact = await contactsService.updateContact(id, data);
      
      return successResponse(res, contact, 'Contact updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await contactsService.deleteContact(id);
      
      return successResponse(res, result, 'Contact deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await contactsService.getContactStats(id);
      
      return successResponse(res, stats, 'Contact stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ContactsController();
