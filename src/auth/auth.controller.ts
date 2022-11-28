import { Controller, Get, HttpStatus, Logger, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private logger = new Logger('startgin kakao-auth-controller');
  constructor(private readonly authService: AuthService) {}

  @Get('/kakao')
  async kakaoLogin() {
    return HttpStatus.OK;
  }

  @Get('/kakao/callback')
  async kakaoCallback(@Req() req: any, @Res() res: any) {
    res.cookie('access_token', req.user.access_token);
    res.cookie('refresh_token', req.user.refresh_token);
    res.redirect(`http://localhost:5173/`);
    res.end();
  }
}
