import { Controller, Post, Get, Body, UseGuards, UsePipes, Req, Res, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response, Request } from 'express';
import { UserService } from '../user/user.service'; 

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService, 
  ) {}

  @Post('login')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
  console.log('Login request received with:', dto); // 👈 add this
  const { access_token, user } = await this.authService.login(dto);
  
  console.log('Generated token:', access_token); // 👈 and this

  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  return { user, accessToken: access_token };

}


@Post('logout')
@UseGuards(JwtAuthGuard)
logout(@Req() req, @Res({ passthrough: true }) res: Response) {
  const token =
    req.cookies['access_token'] ||
    req.headers['authorization']?.replace('Bearer ', '');

  if (token) {
    this.authService.blacklistToken(token);
  }

  // ✅ Make sure this matches your login cookie settings
  res.clearCookie('access_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // change to true in production with HTTPS
    path: '/',     // MUST match what you used in res.cookie() during login
  });

  return { message: 'Logged out' };
}



@Get('me')
@UseGuards(JwtAuthGuard)
async getProfile(@Req() req: any) {
  const userId = req.user.id;
  const fullUser = await this.userService.findById(userId);

  if (!fullUser) {
    return null;
  }

  // Destructure password out and return the rest
  const { password, ...userWithoutPassword } = fullUser;

  return userWithoutPassword;
}




}
