import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getSession } from './session';

export async function getGmailClient() {
  const session = await getSession();

  if (!session?.refreshToken) {
    throw new Error('Not authenticated. Please connect your Gmail account.');
  }

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oAuth2Client.setCredentials({
    refresh_token: session.refreshToken,
  });

  return google.gmail({ version: 'v1', auth: oAuth2Client });
}