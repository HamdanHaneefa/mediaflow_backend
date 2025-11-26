import { Request, Response, NextFunction } from 'express';
import clientPortalService from '../services/client-portal.service';
import { sendSuccess } from '../utils/response';

/**
 * Get client dashboard
 */
export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { period = 'month' } = req.query;

    const dashboard = await clientPortalService.getDashboard(
      req.clientUser.contactId,
      period as string
    );

    sendSuccess(res, dashboard, 'Dashboard data retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get client profile
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const profile = await clientPortalService.getProfile(req.clientUser.contactId);

    sendSuccess(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update client profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { name, phone, company } = req.body;

    const profile = await clientPortalService.updateProfile(req.clientUser.contactId, {
      name,
      phone,
      company,
    });

    sendSuccess(res, profile, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all projects for client
 */
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { status, page = '1', limit = '10', sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const result = await clientPortalService.getProjects(req.clientUser.contactId, {
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    sendSuccess(res, result, 'Projects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single project
 */
export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { id } = req.params;

    const project = await clientPortalService.getProjectById(req.clientUser.contactId, id);

    sendSuccess(res, project, 'Project retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add comment to project
 */
export const addProjectComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { id } = req.params;
    const { comment } = req.body;

    const newComment = await clientPortalService.addProjectComment(
      req.clientUser.contactId,
      id,
      comment,
      req.clientUser.id
    );

    sendSuccess(res, newComment, 'Comment added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all invoices for client
 */
export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { status, page = '1', limit = '10', sortBy = 'expected_date', sortOrder = 'desc' } = req.query;

    const result = await clientPortalService.getInvoices(req.clientUser.contactId, {
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    sendSuccess(res, result, 'Invoices retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single invoice
 */
export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { id } = req.params;

    const invoice = await clientPortalService.getInvoiceById(req.clientUser.contactId, id);

    sendSuccess(res, invoice, 'Invoice retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all proposals for client
 */
export const getProposals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { status, page = '1', limit = '10', sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const result = await clientPortalService.getProposals(req.clientUser.contactId, {
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    sendSuccess(res, result, 'Proposals retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single proposal
 */
export const getProposalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { id } = req.params;

    const proposal = await clientPortalService.getProposalById(req.clientUser.contactId, id);

    sendSuccess(res, proposal, 'Proposal retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to proposal
 */
export const respondToProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { id } = req.params;
    const { status, comments } = req.body;

    const response = await clientPortalService.respondToProposal(
      req.clientUser.contactId,
      id,
      req.clientUser.id,
      status,
      comments
    );

    sendSuccess(res, response, 'Proposal response submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity feed
 */
export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { page, limit } = req.query;
    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;

    const result = await clientPortalService.getActivities(
      req.clientUser.contactId,
      pageNum,
      limitNum,
      req.clientUser.id
    );

    sendSuccess(res, result, 'Activities retrieved successfully');
  } catch (error) {
    next(error);
  }
};
