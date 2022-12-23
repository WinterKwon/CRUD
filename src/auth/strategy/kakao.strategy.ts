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
      // console.log(profile);
      const kakaoEmail = profile._json && profile._json.kakao_account.email;
      const { nickname } = profile._json && profile._json.properties;
      const kakaoPassword = 'kakaoPassword';
      const userProfile = {
        userName: nickname,
        email: kakaoEmail,
        password: kakaoPassword,
      };
      console.log('profile: ', profile);
      console.log(userProfile);
      const user = await this.authService.validateUser(kakaoEmail);

      if (!user) {
        await this.authService.addUser(userProfile);
        // console.log(result);
        const user = await this.authService.validateUser(kakaoEmail);
      }

      const accessToken = await this.authService.createLoginToken(user);
      const refreshToken = await this.authService.createRefreshToken(user);

      return { accessToken, refreshToken, type: 'login' };
    } catch (error) {
      done(error);
    }
  }
}
