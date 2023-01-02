import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    // @InjectModel('users')
    // private readonly userModel: Model<UserDocument>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.KAKAO_ID,
      callbackURL: process.env.KAKAO_CB_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: any,
  ) {
    try {
      const kakaoEmail = profile._json && profile._json.kakao_account.email;
      const { nickname } = profile._json && profile._json.properties;
      const kakaoPassword = 'kakaoPassword';
      const userProfile = {
        userName: nickname,
        email: kakaoEmail,
        password: kakaoPassword,
      };

      const user = await this.authService.validateUser(kakaoEmail);

      if (!user) {
        await this.authService.addUser(userProfile);
        const once_token = await this.authService.onceToken(userProfile);
        return { once_token, type: 'once_token' };
      } else {
        const access_token = await this.authService.createLoginToken(user);
        const refresh_token = await this.authService.createRefreshToken(user);

        return { access_token, refresh_token, type: 'login' };
      }
    } catch (error) {
      done(error);
    }
  }
}
