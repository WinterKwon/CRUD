import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getRequest();
    const { authorization } = req.headers;
    if (!authorization) {
      throw new HttpException('토큰 전송 에러', HttpStatus.UNAUTHORIZED);
    }

    const token = authorization.replace('Bearer ', '');
    const validatedToken = await this.validate(token);

    if (validatedToken.reissueToken) {
      res.setHeader('accessToken', validatedToken.newToken);
      res.setHeader('reissuedToken', true);
      return true;
    } else {
      res.setHeader('reissuedToken', false);
    }
    req.user = validatedToken.user ? validatedToken.user : validatedToken;
    return true;
  }

  async validate(token: string) {
    try {
      const tokenVerify = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      const tokenExpirationTime = new Date(tokenVerify['exp'] * 1000);
      const currentTime = new Date();
      const timeToRemain = Math.floor(
        (tokenExpirationTime.getTime() - currentTime.getTime()) / 1000 / 60,
      );

      //accesstoken이 로그인토큰이 아니라면 verify 결과 반환
      if (tokenVerify.userToken !== 'loginToken') {
        return tokenVerify;
      }

      //accesstoken의 만료 시간이 5분 미만으로 남았다면 refreshtoken 재발급
      const LIMIT = 5;
      if (timeToRemain < LIMIT) {
        const user = await this.userService.getOne(tokenVerify.email);
        const refreshToken = await this.authService.validateToken(
          user.refreshToken,
        );
        const refreshTokenUser = await this.userService.getOne(
          refreshToken.email,
        );
        const newToken = await this.authService.createLoginToken(
          refreshTokenUser,
        );

        return {
          user: refreshTokenUser,
          newToken,
          reissueToken: true,
        };
      } else {
        const user = await this.userService.getOne(tokenVerify.email);
        return {
          user,
          reissueToken: false,
        };
      }
    } catch (err) {
      switch (err.message) {
        case 'invalid token':
          throw new HttpException('Token is invalid', 401);

        case 'expired token':
          throw new HttpException('Token has been expired', 401);

        default:
          throw new HttpException(`${err}`, 401);
      }
    }
  }
}
