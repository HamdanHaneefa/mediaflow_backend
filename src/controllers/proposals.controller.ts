// @ts-nocheck
import { NextFunction, Request, Response } from 'express';
import env from '../config/env';
import { EmailService } from '../services/email.service';
import { ProposalPDFService } from '../services/proposal-pdf.service';
import { LeadService, ProposalService } from '../services/proposals.service';
import { successResponse } from '../utils/response';

const leadService = new LeadService();
const proposalService = new ProposalService();
const pdfService = new ProposalPDFService();
const emailService = new EmailService();

// ==================== LEADS ====================

export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id;
    const lead = await leadService.create({ ...req.body, created_by: userId });
    successResponse(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await leadService.list(req.query);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await leadService.getById(req.params.id);
    successResponse(res, lead);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await leadService.update(req.params.id, req.body);
    successResponse(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await leadService.delete(req.params.id);
    successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const convertLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await leadService.convert(req.params.id, {
      ...req.body,
      converted_by: userId,
    });
    successResponse(res, result, 'Lead converted to client successfully');
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await leadService.getStats(req.query);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

// ==================== PROPOSALS ====================

export const createProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const proposal = await proposalService.create({ ...req.body, created_by: userId });
    successResponse(res, proposal, 'Proposal created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listProposals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await proposalService.list(req.query);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalService.getById(req.params.id);
    successResponse(res, proposal);
  } catch (error) {
    next(error);
  }
};

export const updateProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalService.update(req.params.id, req.body);
    successResponse(res, proposal, 'Proposal updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProposalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const proposal = await proposalService.updateStatus(req.params.id, status);
    successResponse(res, proposal, `Proposal status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const deleteProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await proposalService.delete(req.params.id);
    successResponse(res, null, 'Proposal deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const generateProposalPDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pdfPath = await pdfService.generatePDF(req.params.id);
    successResponse(res, { pdfUrl: pdfPath }, 'Proposal PDF generated successfully');
  } catch (error) {
    next(error);
  }
};

export const sendProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalService.getById(req.params.id);
    
    // Update status to Sent if it's Draft
    if (proposal.status === 'Draft') {
      await proposalService.updateStatus(req.params.id, 'Sent');
    }

    // Get recipient info
    const recipient = proposal.client_id ? proposal.client : proposal.lead;
    if (!recipient?.email) {
      throw new Error('Recipient email not found');
    }

    // Generate public URL
    const baseUrl = env.FRONTEND_URL || 'http://localhost:5173';
    const publicUrl = `${baseUrl}/proposals/view/${proposal.public_token}`;

    // Send email
    await emailService.sendProposalEmail(recipient.email, {
      proposalNumber: proposal.proposal_number,
      title: proposal.title,
      total: Number(proposal.total),
      validUntil: proposal.valid_until,
      publicUrl,
      recipientName: recipient.name,
      senderName: `${proposal.creator.first_name} ${proposal.creator.last_name}`,
    });

    successResponse(res, { sentTo: recipient.email }, 'Proposal sent successfully');
  } catch (error) {
    next(error);
  }
};

export const getProposalStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await proposalService.getStats(req.query);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

// ==================== PUBLIC ENDPOINTS ====================

export const viewPublicProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalService.getByToken(req.params.token);
    
    // Track the view
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await proposalService.trackView(proposal.id, {
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    successResponse(res, proposal);
  } catch (error) {
    next(error);
  }
};

export const signProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalService.getByToken(req.params.token);
    
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const result = await proposalService.sign(proposal.id, {
      ...req.body,
      ip_address: ipAddress,
    });

    // Send notification to proposal creator
    const creator = result.proposal.creator;
    if (creator?.email) {
      await emailService.sendProposalAcceptedNotification(creator.email, {
        proposalNumber: result.proposal.proposal_number,
        title: result.proposal.title,
        signerName: req.body.signer_name,
        signedAt: new Date(),
      });
    }

    successResponse(res, result, 'Proposal signed successfully');
  } catch (error) {
    next(error);
  }
};

export const trackProposalView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalService.getByToken(req.params.token);
    
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    
    await proposalService.trackView(proposal.id, {
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    successResponse(res, null, 'View tracked successfully');
  } catch (error) {
    next(error);
  }
};
