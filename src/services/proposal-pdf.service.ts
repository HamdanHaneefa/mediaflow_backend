import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export class ProposalPDFService {
  async generatePDF(id: string): Promise<string> {
    const proposal = await prisma.proposals.findUnique({
      where: { id },
      include: {
        client: true,
        lead: true,
        items: {
          orderBy: {
            created_at: 'asc',
          },
        },
        creator: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Generate HTML for the proposal
    const html = this.generateProposalHTML(proposal);

    // Create proposals directory if it doesn't exist
    const proposalsDir = path.join(process.cwd(), 'uploads', 'proposals');
    if (!fs.existsSync(proposalsDir)) {
      fs.mkdirSync(proposalsDir, { recursive: true });
    }

    const filename = `proposal-${proposal.proposal_number}-${Date.now()}.html`;
    const filepath = path.join(proposalsDir, filename);

    // Save as HTML (can be converted to PDF with Puppeteer later)
    fs.writeFileSync(filepath, html);

    return `/uploads/proposals/${filename}`;
  }

  private generateProposalHTML(proposal: any): string {
    const recipient = proposal.client || proposal.lead;
    const recipientName = recipient?.name || 'Valued Client';
    const recipientCompany = recipient?.company || '';
    const recipientEmail = recipient?.email || '';
    const recipientPhone = recipient?.phone || '';
    const recipientAddress = recipient?.address || '';

    const itemsHTML = proposal.items.map((item: any, index: number) => `
      <tr>
        <td style="padding: 16px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${index + 1}</td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.title}</div>
          ${item.description ? `<div style="font-size: 14px; color: #6b7280;">${item.description}</div>` : ''}
        </td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${item.amount.toFixed(2)}</td>
      </tr>
    `).join('');

    const validUntil = new Date(proposal.valid_until);
    const isExpired = new Date() > validUntil;
    const statusColor = {
      'Draft': '#6b7280',
      'Sent': '#3b82f6',
      'Viewed': '#8b5cf6',
      'Accepted': '#10b981',
      'Rejected': '#ef4444',
      'Expired': '#f59e0b'
    }[proposal.status] || '#6b7280';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Proposal ${proposal.proposal_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      background: #f9fafb;
      padding: 40px 20px;
    }
    .container { 
      max-width: 900px; 
      margin: 0 auto; 
      background: white; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    .header { 
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); 
      color: white; 
      padding: 60px 40px;
      text-align: center;
    }
    .company-logo { 
      font-size: 32px; 
      font-weight: bold; 
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }
    .proposal-title { 
      font-size: 48px; 
      font-weight: bold; 
      margin-bottom: 12px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .proposal-number { 
      font-size: 20px; 
      opacity: 0.9;
      font-weight: 500;
    }
    .content { padding: 50px 40px; }
    .section { margin-bottom: 50px; }
    .section-title { 
      font-size: 24px; 
      font-weight: bold; 
      color: #7c3aed; 
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #7c3aed;
    }
    .info-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 30px; 
      margin-bottom: 40px;
    }
    .info-box {
      background: #f9fafb;
      padding: 24px;
      border-radius: 8px;
      border-left: 4px solid #7c3aed;
    }
    .info-label { 
      font-size: 12px; 
      text-transform: uppercase; 
      color: #6b7280; 
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .info-value { 
      font-size: 16px; 
      color: #1f2937;
      font-weight: 500;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      background: ${statusColor};
      color: white;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 30px 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    th { 
      background: #7c3aed; 
      color: white; 
      padding: 16px 12px; 
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .totals { 
      float: right; 
      width: 400px;
      background: #f9fafb;
      padding: 24px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .total-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 12px 0;
      font-size: 16px;
    }
    .grand-total { 
      font-size: 24px; 
      font-weight: bold; 
      border-top: 3px solid #7c3aed; 
      margin-top: 16px; 
      padding-top: 16px;
      color: #7c3aed;
    }
    .text-content {
      font-size: 16px;
      line-height: 1.8;
      color: #374151;
      background: #f9fafb;
      padding: 24px;
      border-radius: 8px;
      border-left: 4px solid #7c3aed;
    }
    .signature-section {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px dashed #d1d5db;
    }
    .signature-box {
      background: #f9fafb;
      padding: 30px;
      border-radius: 8px;
      border: 2px dashed #7c3aed;
      text-align: center;
    }
    .footer {
      background: #1f2937;
      color: white;
      padding: 40px;
      text-align: center;
      font-size: 14px;
    }
    .footer-links {
      margin-top: 20px;
      opacity: 0.8;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-logo">🎬 MediaFlow CRM</div>
      <div class="proposal-title">PROPOSAL</div>
      <div class="proposal-number">${proposal.proposal_number}</div>
    </div>
    
    <div class="content">
      <!-- Proposal Info -->
      <div class="info-grid">
        <div class="info-box">
          <div class="info-label">Prepared For</div>
          <div class="info-value" style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${recipientName}</div>
          ${recipientCompany ? `<div class="info-value">${recipientCompany}</div>` : ''}
          ${recipientEmail ? `<div class="info-value" style="color: #6b7280;">${recipientEmail}</div>` : ''}
          ${recipientPhone ? `<div class="info-value" style="color: #6b7280;">${recipientPhone}</div>` : ''}
          ${recipientAddress ? `<div class="info-value" style="color: #6b7280; margin-top: 8px;">${recipientAddress}</div>` : ''}
        </div>
        
        <div class="info-box">
          <div class="info-label">Proposal Details</div>
          <div style="margin-bottom: 12px;">
            <div class="info-label" style="margin-bottom: 4px;">Date</div>
            <div class="info-value">${new Date(proposal.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div style="margin-bottom: 12px;">
            <div class="info-label" style="margin-bottom: 4px;">Valid Until</div>
            <div class="info-value" style="color: ${isExpired ? '#ef4444' : '#10b981'};">
              ${validUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              ${isExpired ? ' (Expired)' : ''}
            </div>
          </div>
          <div>
            <div class="info-label" style="margin-bottom: 8px;">Status</div>
            <span class="status-badge">${proposal.status}</span>
          </div>
        </div>
      </div>

      <!-- Title Section -->
      <div class="section">
        <h1 style="font-size: 32px; color: #1f2937; margin-bottom: 20px;">${proposal.title}</h1>
      </div>

      <!-- Introduction -->
      ${proposal.introduction ? `
      <div class="section">
        <div class="section-title">Introduction</div>
        <div class="text-content">${proposal.introduction.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}

      <!-- Scope of Work -->
      ${proposal.scope_of_work ? `
      <div class="section">
        <div class="section-title">Scope of Work</div>
        <div class="text-content">${proposal.scope_of_work.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}

      <!-- Deliverables -->
      ${proposal.deliverables ? `
      <div class="section">
        <div class="section-title">Deliverables</div>
        <div class="text-content">${proposal.deliverables.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}

      <!-- Timeline -->
      ${proposal.timeline ? `
      <div class="section">
        <div class="section-title">Timeline</div>
        <div class="text-content">${proposal.timeline.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}

      <!-- Investment -->
      <div class="section">
        <div class="section-title">Investment</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Item</th>
              <th style="width: 100px; text-align: center;">Quantity</th>
              <th style="width: 120px; text-align: right;">Unit Price</th>
              <th style="width: 120px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span style="color: #6b7280;">Subtotal</span>
            <span style="font-weight: 600;">$${proposal.subtotal.toFixed(2)}</span>
          </div>
          ${proposal.tax_rate > 0 ? `
          <div class="total-row">
            <span style="color: #6b7280;">Tax (${proposal.tax_rate}%)</span>
            <span style="font-weight: 600;">$${proposal.tax_amount.toFixed(2)}</span>
          </div>
          ` : ''}
          ${proposal.discount > 0 ? `
          <div class="total-row">
            <span style="color: #6b7280;">Discount</span>
            <span style="font-weight: 600; color: #10b981;">-$${proposal.discount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="total-row grand-total">
            <span>Total Investment</span>
            <span>$${proposal.total.toFixed(2)}</span>
          </div>
        </div>
        <div style="clear: both;"></div>
      </div>

      <!-- Terms & Conditions -->
      ${proposal.terms ? `
      <div class="section">
        <div class="section-title">Terms & Conditions</div>
        <div class="text-content">${proposal.terms.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}

      <!-- Notes -->
      ${proposal.notes ? `
      <div class="section">
        <div class="section-title">Additional Notes</div>
        <div class="text-content">${proposal.notes.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}

      <!-- Signature Section -->
      <div class="signature-section">
        <div class="section-title">Acceptance</div>
        <p style="margin-bottom: 24px; color: #6b7280;">
          By signing below, you accept this proposal and agree to the terms and conditions outlined above.
        </p>
        <div class="signature-box">
          ${proposal.signature ? `
            <div style="margin-bottom: 16px;">
              <img src="${proposal.signature.signature_data}" alt="Signature" style="max-width: 300px; height: auto;" />
            </div>
            <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px;">${proposal.signature.signer_name}</div>
            ${proposal.signature.signer_title ? `<div style="color: #6b7280; margin-bottom: 8px;">${proposal.signature.signer_title}</div>` : ''}
            <div style="color: #6b7280;">Signed on ${new Date(proposal.signature.signed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          ` : `
            <div style="color: #6b7280; font-style: italic;">
              Awaiting client signature
            </div>
          `}
        </div>
      </div>
    </div>

    <div class="footer">
      <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">MediaFlow CRM</div>
      <div>Professional Media Production Services</div>
      <div class="footer-links">
        ${proposal.creator ? `<div>Prepared by ${proposal.creator.first_name} ${proposal.creator.last_name} | ${proposal.creator.email}</div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
