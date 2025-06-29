import {
  Controller,
  Get,
  Headers,
  Put,
  Body,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Query, Res
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ✅ Get logged-in user's profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.findById(req.user.userId);
  }

  // ✅ Update profile details with validation
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Put('profile')
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    
return this.userService.updateProfile(req.user.id, dto);
  }



  @UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Put('profile/password')
changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
  return this.userService.changePassword(req.user.id, dto);
}


// ✅ Request password reset link
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Post('forgot-password')
async forgotPassword(@Body() dto: ForgotPasswordDto) {
  const result = await this.userService.requestPasswordReset(dto.email);
  return {
    message: result.message,
    previewLink: result.previewLink,
  };
}
  
  // ✅ Reset password using token
  @Put('reset-password')
  async resetPassword(
    @Headers('reset-token') token: string,
    @Body() body: { newPassword: string }
  ) {
    const result = await this.userService.resetPassword(token, body.newPassword);
    return { message: result };
  }

  // ✅ Upload dp
@UseGuards(JwtAuthGuard)
@Post('profile/avatar')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: 'uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${file.originalname.split('.').pop()}`;
        cb(null, uniqueName);
      },
    }),
  }),
)
async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
  try {
    const userId = req.user?.id; // ✅ use `id` instead of `userId`
    if (!userId) {
      throw new Error('Invalid user in request');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const updatedUser = await this.userService.updateAvatar(userId, avatarUrl);
    return updatedUser;
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
}






  
}
