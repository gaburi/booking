import { NextRequest, NextResponse } from 'next/server';
import { googleMeetService } from '@/lib/google-meet';

/**
 * GET /api/auth/google/callback
 * Handles OAuth callback from Google and exchanges code for tokens
 * 
 * This endpoint is called automatically after user authorizes the app
 * 
 * ⚠️ SECURITY: Delete this file after obtaining your refresh token!
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json(
            {
                error: 'Authorization denied',
                details: error,
                message: 'User denied access or authorization failed'
            },
            { status: 400 }
        );
    }

    if (!code) {
        return NextResponse.json(
            {
                error: 'No authorization code provided',
                message: 'The OAuth flow did not return a code parameter'
            },
            { status: 400 }
        );
    }

    try {
        const tokens = await googleMeetService.getTokens(code);

        // Return tokens in a user-friendly format
        return new NextResponse(
            `
<!DOCTYPE html>
<html>
<head>
  <title>Google Meet Setup - Success!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #10b981;
      margin-top: 0;
    }
    .token-box {
      background: #1f2937;
      color: #10b981;
      padding: 15px;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      word-break: break-all;
      margin: 20px 0;
    }
    .instructions {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
    }
    .instructions ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .warning {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
    }
    code {
      background: #e5e7eb;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
    }
    button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ Authorization Successful!</h1>
    <p>Your Google Meet integration is almost ready. Follow the steps below:</p>
    
    <div class="instructions">
      <h3>📋 Next Steps:</h3>
      <ol>
        <li>Copy the <strong>refresh_token</strong> below</li>
        <li>Open your <code>.env</code> file</li>
        <li>Update: <code>GOOGLE_REFRESH_TOKEN="paste_token_here"</code></li>
        <li>Restart your Next.js server: <code>npm run dev</code></li>
        <li>Test by creating an online booking</li>
      </ol>
    </div>

    <h3>🔑 Your Refresh Token:</h3>
    <div class="token-box" id="refreshToken">${tokens.refresh_token || 'Not provided - you may need to re-authorize with prompt=consent'}</div>
    <button onclick="copyToken()">📋 Copy Token</button>

    <div class="warning">
      <h3>⚠️ IMPORTANT SECURITY STEPS:</h3>
      <ol>
        <li><strong>Never commit this token to Git!</strong> It's already in <code>.env</code> which is gitignored.</li>
        <li><strong>Delete the authorization endpoints:</strong>
          <ul>
            <li><code>src/app/api/auth/google/authorize/route.ts</code></li>
            <li><code>src/app/api/auth/google/callback/route.ts</code></li>
          </ul>
        </li>
        <li>These endpoints are only needed once for setup.</li>
      </ol>
    </div>

    <details style="margin-top: 20px;">
      <summary style="cursor: pointer; color: #6b7280;">🔍 View All Token Data (for debugging)</summary>
      <pre style="background: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px;">${JSON.stringify(tokens, null, 2)}</pre>
    </details>
  </div>

  <script>
    function copyToken() {
      const token = document.getElementById('refreshToken').textContent;
      navigator.clipboard.writeText(token).then(() => {
        alert('✅ Token copied to clipboard!');
      }).catch(err => {
        alert('❌ Failed to copy. Please select and copy manually.');
      });
    }
  </script>
</body>
</html>
      `,
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                },
            }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                error: 'Failed to exchange code for tokens',
                message: error.message,
                hint: 'Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct in .env'
            },
            { status: 500 }
        );
    }
}
