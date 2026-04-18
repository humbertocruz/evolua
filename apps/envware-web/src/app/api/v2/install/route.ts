import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. Track the download event
    await trackEvent('install_script');

    // 2. Read the install.sh file from public folder
    const filePath = path.join(process.cwd(), 'public', 'install.sh');
    const fileBuffer = fs.readFileSync(filePath);

    // 3. Return the file as text/x-sh
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'text/x-sh',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[INSTALL SCRIPT ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
