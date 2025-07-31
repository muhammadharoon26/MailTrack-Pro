import { google } from 'googleapis'; // Import the main google object
import { OAuth2Client } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/session';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    // Exchange the code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    if (!tokens.refresh_token) {
      // This can happen if the user has already approved consent.
      // In a real app, you might want to check your database for an existing refresh token.
      console.warn("Refresh token not received. User may have already consented.");
    }

    // --- NEW: Fetch the user's profile information ---
    const oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: 'v2'
    });
    const { data: userInfo } = await oauth2.userinfo.get();
    // ---------------------------------------------

    // Create a session object with the tokens AND user info
    const session = {
      refreshToken: tokens.refresh_token,
      user: {
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      }
    };

    // Encrypt the session and set it as a cookie
    const encryptedSession = await encrypt(session);
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;

  } catch (error) {
    console.error('Failed to authenticate with Google:', error);
    return NextResponse.json({ error: 'Failed to authenticate with Google.' }, { status: 500 });
  }
}