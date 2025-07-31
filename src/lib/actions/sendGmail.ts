'use server';
import { getGmailClient } from '../gmail-client';

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export async function sendGmail(params: SendEmailParams) {
  try {
    const gmail = await getGmailClient();
    
    const emailLines = [
      'Content-Type: text/html; charset="UTF-8"',
      'MIME-Version: 1.0',
      `To: ${params.to}`,
    ];
    if (params.cc) {
      emailLines.push(`Cc: ${params.cc}`);
    }
     if (params.bcc) {
      emailLines.push(`Bcc: ${params.bcc}`);
    }
    emailLines.push(`Subject: =?utf-8?B?${Buffer.from(params.subject).toString('base64')}?=`);
    emailLines.push('');
    emailLines.push(params.body);

    const email = emailLines.join('\r\n');

    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return { success: true };

  } catch (error: any) {
    console.error('Failed to send email via Gmail API:', error.message);
    return { success: false, message: 'Could not send email. The authentication token might have expired or been revoked. Please try reconnecting your Gmail account.' };
  }
}