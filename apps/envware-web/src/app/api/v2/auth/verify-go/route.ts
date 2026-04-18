import { NextResponse } from 'next/server';
import * as nodeCrypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { publicKey, signature, challenge } = await request.json();

    if (!publicKey || !signature || !challenge) {
      return NextResponse.json({ verified: false, error: 'Missing fields' }, { status: 400 });
    }

    let isVerified = false;
    try {
      const parts = publicKey.trim().split(' ');
      const keyData = parts.length > 1 ? parts[1] : parts[0];
      const buffer = Buffer.from(keyData, 'base64');

      let offset = 0;
      function readString() {
        if (offset + 4 > buffer.length) return null;
        const len = buffer.readUInt32BE(offset);
        offset += 4;
        if (offset + len > buffer.length) return null;
        const str = buffer.slice(offset, offset + len);
        offset += len;
        return str;
      }

      const typeBuf = readString();
      if (!typeBuf || typeBuf.toString() !== 'ssh-rsa') {
        throw new Error('Only ssh-rsa is supported for manual parsing currently');
      }

      const e = readString();
      const n = readString();

      if (!e || !n) throw new Error('Invalid SSH-RSA key data');

      // mpint format: if high bit is set, prepend 0x00
      const eBuf = e[0] & 0x80 ? Buffer.concat([Buffer.from([0]), e]) : e;
      const nBuf = n[0] & 0x80 ? Buffer.concat([Buffer.from([0]), n]) : n;

      // Convert to PEM format
      const jwk = {
        kty: 'RSA',
        n: nBuf.toString('base64url'),
        e: eBuf.toString('base64url'),
        ext: true,
      };
      const keyObj = nodeCrypto.createPublicKey(JSON.stringify(jwk));

      // No Go fizemos SignPKCS1v15(..., hashed[:]). 
      // El Node verify('RSA-SHA256', ...) hace el hash del challenge.
      const hashedChallenge = nodeCrypto.createHash('sha256').update(challenge).digest();
      isVerified = nodeCrypto.verify(
        null,
        hashedChallenge,
        keyObj,
        Buffer.from(signature, 'base64')
      );
      
      console.log('[AUTH-GO] Verificação:', isVerified);
    } catch (e) {
      console.error('[AUTH-GO] Erro:', e);
    }

    return NextResponse.json({ verified: isVerified });
  } catch (error) {
    return NextResponse.json({ verified: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { publicKey, plainText } = await request.json();

    const parts = publicKey.trim().split(' ');
    const keyData = parts.length > 1 ? parts[1] : parts[0];
    const buffer = Buffer.from(keyData, 'base64');

    let offset = 0;
    function readString() {
      const len = buffer.readUInt32BE(offset);
      offset += 4;
      const str = buffer.slice(offset, offset + len);
      offset += len;
      return str;
    }

    readString(); // skip type
    const e = readString();
    const n = readString();

    const keyObj = nodeCrypto.createPublicKey({
      key: {
        kty: 'RSA',
        n: n.toString('base64url'),
        e: e.toString('base64url'),
      },
      format: 'jwk',
    });

    const encrypted = nodeCrypto.publicEncrypt(
      {
        key: keyObj,
        padding: nodeCrypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(plainText)
    );

    return NextResponse.json({ success: true, encryptedData: encrypted.toString('base64') });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
