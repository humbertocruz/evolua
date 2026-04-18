import { headers } from 'next/headers';
import { verifyToken } from './jwt';

export async function getAuthorizedUser() {
  const headersList = await headers();
  
  // 1. Version enforcement (Block old CLI versions)
  // Permitimos acesso via browser (Next.js client) mas bloqueamos se for CLI (axios) abaixo da 1.3.0
  const version = headersList.get('x-envware-version');
  const userAgent = headersList.get('user-agent') || '';
  const isCli = userAgent.toLowerCase().includes('axios') || version;

  if (isCli && (!version || version < '1.4.2')) {
    return { 
      error: 'CLI_UPDATE_REQUIRED', 
      message: 'Please update your CLI to version 1.4.2 or higher. Run "npm install -g envware"' 
    };
  }

  // 2. Token verification
  const authHeader = headersList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || typeof decoded !== 'object') {
    return null;
  }

  return {
    id: decoded.sub as string,
    email: decoded.email as string,
  };
}
