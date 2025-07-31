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
    const { tokens } = await oAuth2Client.getToken(code);
    
    // The refresh_token is only provided on the very first authorization.
    // We must store it securely to make authenticated requests in the future.
    if (!tokens.refresh_token) {
      throw new Error("Refresh token not received from Google. Please ensure you are using prompt: 'consent'.");
    }

    const session = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };

    // Encrypt the session data into a JWT
    const encryptedSession = await encrypt(session);
    
    // Redirect the user back to the home page and set the secure cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('session', encryptedSession, {
      httpOnly: true, // The cookie is not accessible via client-side JavaScript
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;

  } catch (error) {
    console.error('Failed to exchange code for tokens:', error);
    return NextResponse.json({ error: 'Failed to authenticate with Google.' }, { status: 500 });
  }
}