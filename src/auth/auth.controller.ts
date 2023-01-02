import { Controller, Get, HttpStatus, Logger, Req, Res } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { KakaoAuthGuard } from './guard/kakao.auth.guard';

@Controller('auth')
export class AuthController {
  private logger = new Logger('starting kakao-auth-controller');
  constructor(private readonly authService: AuthService) {}

  @Get('/kakao')
  @UseGuards(new KakaoAuthGuard('kakao'))
  async kakaoLogin() {
    return HttpStatus.OK;
  }

  @Get('/kakao/callback')
  @UseGuards(new KakaoAuthGuard('kakao'))
  async kakaoCallback(@Req() req: any, @Res() res: any) {
    console.log('req: ', req);
    if (req.user.type === 'once_token') {
      res.cookie('once_token', req.user.once_token);
    }
    res.cookie('access_token', req.user.access_token);
    res.cookie('refresh_token', req.user.refresh_token);

    res.redirect(`http://localhost:5173/`);
    // console.log(req.user);
    // res.redirect(
    //   `${process.env.CLIENT_HOST}?access=${req.user.accessToken}&refresh=${req.user.refreshToken}`,
    // );
    res.end();
  }
}
