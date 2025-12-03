// @ts-nocheck
import nodemailer from 'nodemailer';
import env from '../config/env';

export class EmailService {
  private transporter;

  constructor() {
    // Configure email transporter based on environment
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_SECURE || false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendProposalEmail(
    to: string,
    proposalData: {
      proposalNumber: string;
      title: string;
      total: number;
      validUntil: Date;
      publicUrl: string;
      recipientName: string;
      senderName: string;
    }
  ): Promise<void> {
    const { proposalNumber, title, total, validUntil, publicUrl, recipientName, senderName } = proposalData;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Proposal from MediaFlow CRM</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      background: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .email-container { 
      max-width: 600px; 
      margin: 40px auto; 
      background: white; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); 
      color: white; 
      padding: 40px;
      text-align: center;
    }
    .logo { 
      font-size: 24px; 
      font-weight: bold; 
      margin-bottom: 16px;
    }
    .header-title { 
      font-size: 28px; 
      font-weight: bold;
      margin-bottom: 8px;
    }
    .content { 
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 24px;
      color: #1f2937;
    }
    .proposal-info {
      background: #f9fafb;
      border-left: 4px solid #7c3aed;
      padding: 24px;
      margin: 24px 0;
      border-radius: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
    }
    .info-value {
      color: #1f2937;
      font-weight: 500;
    }
    .cta-button {
      display: inline-block;
      background: #7c3aed;
      color: white;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .cta-button:hover {
      background: #6d28d9;
    }
    .footer {
      background: #f9fafb;
      padding: 32px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .footer-note {
      margin-top: 16px;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">🎬 MediaFlow CRM</div>
      <div class="header-title">New Proposal</div>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${recipientName},
      </div>
      
      <p style="margin-bottom: 24px; color: #374151;">
        ${senderName} has prepared a new proposal for you. Please review the details below and click the button to view the full proposal.
      </p>
      
      <div class="proposal-info">
        <div class="info-row">
          <span class="info-label">Proposal #</span>
          <span class="info-value">${proposalNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Title</span>
          <span class="info-value">${title}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Investment</span>
          <span class="info-value" style="font-size: 18px; color: #7c3aed; font-weight: 700;">$${total.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Valid Until</span>
          <span class="info-value">${new Date(validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${publicUrl}" class="cta-button">
          📄 View Proposal
        </a>
      </div>
      
      <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
        If you have any questions or need clarification on any aspect of this proposal, please don't hesitate to reach out.
      </p>
      
      <p style="margin-top: 16px; color: #374151;">
        Best regards,<br>
        <strong>${senderName}</strong><br>
        MediaFlow CRM
      </p>
    </div>
    
    <div class="footer">
      <div>
        This proposal was sent from MediaFlow CRM
      </div>
      <div class="footer-note">
        This is an automated message. Please do not reply directly to this email.
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    await this.transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `New Proposal: ${proposalNumber} - ${title}`,
      html,
    });
  }

  async sendProposalReminderEmail(
    to: string,
    proposalData: {
      proposalNumber: string;
      title: string;
      validUntil: Date;
      publicUrl: string;
      recipientName: string;
      daysRemaining: number;
    }
  ): Promise<void> {
    const { proposalNumber, title, validUntil, publicUrl, recipientName, daysRemaining } = proposalData;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Proposal Reminder</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      background: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .email-container { 
      max-width: 600px; 
      margin: 40px auto; 
      background: white; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
      color: white; 
      padding: 40px;
      text-align: center;
    }
    .logo { 
      font-size: 24px; 
      font-weight: bold; 
      margin-bottom: 16px;
    }
    .header-title { 
      font-size: 28px; 
      font-weight: bold;
      margin-bottom: 8px;
    }
    .content { 
      padding: 40px;
    }
    .warning-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }
    .cta-button {
      display: inline-block;
      background: #f59e0b;
      color: white;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .footer {
      background: #f9fafb;
      padding: 32px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">🎬 MediaFlow CRM</div>
      <div class="header-title">⏰ Proposal Reminder</div>
    </div>
    
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 24px; color: #1f2937;">
        Hi ${recipientName},
      </p>
      
      <p style="margin-bottom: 24px; color: #374151;">
        This is a friendly reminder about your pending proposal <strong>${proposalNumber}</strong>.
      </p>
      
      <div class="warning-box">
        <div style="font-size: 24px; font-weight: bold; color: #92400e; margin-bottom: 8px;">
          ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining
        </div>
        <div style="color: #78350f;">
          This proposal expires on ${new Date(validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <p style="margin-bottom: 24px; color: #374151;">
        <strong>Proposal:</strong> ${title}
      </p>
      
      <div style="text-align: center;">
        <a href="${publicUrl}" class="cta-button">
          📄 Review Proposal
        </a>
      </div>
      
      <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
        If you have any questions or would like to discuss this proposal, please contact us.
      </p>
    </div>
    
    <div class="footer">
      <div>
        This proposal was sent from MediaFlow CRM
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    await this.transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `⏰ Reminder: Proposal ${proposalNumber} - ${daysRemaining} days remaining`,
      html,
    });
  }

  async sendProposalAcceptedNotification(
    to: string,
    proposalData: {
      proposalNumber: string;
      title: string;
      signerName: string;
      signedAt: Date;
    }
  ): Promise<void> {
    const { proposalNumber, title, signerName, signedAt } = proposalData;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Proposal Accepted</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      background: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .email-container { 
      max-width: 600px; 
      margin: 40px auto; 
      background: white; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
      color: white; 
      padding: 40px;
      text-align: center;
    }
    .logo { 
      font-size: 24px; 
      font-weight: bold; 
      margin-bottom: 16px;
    }
    .header-title { 
      font-size: 32px; 
      font-weight: bold;
      margin-bottom: 8px;
    }
    .content { 
      padding: 40px;
    }
    .success-box {
      background: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 24px;
      margin: 24px 0;
      border-radius: 8px;
      text-align: center;
    }
    .footer {
      background: #f9fafb;
      padding: 32px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">🎬 MediaFlow CRM</div>
      <div class="header-title">🎉 Proposal Accepted!</div>
    </div>
    
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 24px; color: #1f2937;">
        Great news!
      </p>
      
      <p style="margin-bottom: 24px; color: #374151;">
        The proposal <strong>${proposalNumber}</strong> has been accepted and signed.
      </p>
      
      <div class="success-box">
        <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
        <div style="font-size: 20px; font-weight: bold; color: #065f46; margin-bottom: 12px;">
          ${title}
        </div>
        <div style="color: #047857;">
          Signed by <strong>${signerName}</strong>
        </div>
        <div style="color: #047857; margin-top: 8px;">
          ${new Date(signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <p style="margin-top: 32px; color: #374151;">
        You can now proceed with the next steps to begin working on this project.
      </p>
    </div>
    
    <div class="footer">
      <div>
        This notification was sent from MediaFlow CRM
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    await this.transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `✅ Proposal Accepted: ${proposalNumber}`,
      html,
    });
  }
}
