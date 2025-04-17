import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  signAccessToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN as string, {
      expiresIn: '5m',
    });
  }

  signRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN as string, {
      expiresIn: '3d',
    });
  }

  signActivationToken(user: any): string {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    return jwt.sign(
      { user, activationCode },
      process.env.ACTIVATION_SECRET as string,
      {
        expiresIn: '5m',
      },
    );
  }

  verifyActivationToken(token: string) {
    return jwt.verify(token, process.env.ACTIVATION_SECRET as string) as {
      user: any;
      activationCode: string;
    };
  }

  extractActivationCode(token: string): string {
    const decoded = jwt.decode(token) as any;
    return decoded.activationCode;
  }

  accessTokenOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // 5 minutes
    };
  }

  refreshTokenOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    };
  }
}
