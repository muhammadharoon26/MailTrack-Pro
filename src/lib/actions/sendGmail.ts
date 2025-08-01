'use server';
import { getGmailClient } from '../gmail-client';
import { google } from 'googleapis';

interface Attachment {
  filename: string;
  contentType: string;
  content: string; // Base64 encoded content
}

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  attachments?: Attachment[];
}

export async function sendGmail(params: SendEmailParams) {
  try {
    const gmail = await getGmailClient();
    const boundary = `----=_Part_${Math.random().toString(36).substring(2)}`;
    
    let emailBody = '';

    // Headers
    emailBody += `To: ${params.to}\r\n`;
    if (params.cc) emailBody += `Cc: ${params.cc}\r\n`;
    if (params.bcc) emailBody += `Bcc: ${params.bcc}\r\n`;
    emailBody += `Subject: =?utf-8?B?${Buffer.from(params.subject).toString('base64')}?=\r\n`;
    emailBody += 'MIME-Version: 1.0\r\n';
    emailBody += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

    // Main text part
    emailBody += `--${boundary}\r\n`;
    emailBody += 'Content-Type: text/html; charset="UTF-8"\r\n\r\n';
    emailBody += `${params.body}\r\n\r\n`;

    // Attachment parts
    if (params.attachments) {
      for (const attachment of params.attachments) {
        emailBody += `--${boundary}\r\n`;
        emailBody += `Content-Type: ${attachment.contentType}; name="${attachment.filename}"\r\n`;
        emailBody += 'Content-Transfer-Encoding: base64\r\n';
        emailBody += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n\r\n`;
        emailBody += `${attachment.content}\r\n\r\n`;
      }
    }

    // End boundary
    emailBody += `--${boundary}--`;
    
    const encodedEmail = Buffer.from(emailBody)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return { success: true };

  } catch (error: any) {
    console.error('Failed to send email via Gmail API:', error);
    let message = 'Could not send email. Please try again.';
    if(error.message?.includes('token')){
      message = 'The authentication token might have expired. Please try reconnecting your Gmail account.';
    }
    return { success: false, message };
  }
}
