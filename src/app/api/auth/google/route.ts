import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Generate the url that will be used for the consent dialog.
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' is crucial for getting a refresh token
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.send', // The permission to send email
    ],
    prompt: 'consent', // This forces the consent screen every time, ensuring a refresh token is sent.
  });

  return NextResponse.redirect(authorizeUrl);
}