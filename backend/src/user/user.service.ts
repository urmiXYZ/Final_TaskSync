import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PasswordResetRequest } from './entities/password-reset-request.entity';
import { RequestUser } from './entities/request-user.entity';
import { Role } from './entities/role.entity';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(PasswordResetRequest) private resetRequestRepo: Repository<PasswordResetRequest>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(RequestUser) private readonly requestUserRepository: Repository<RequestUser>,
    private readonly emailService: EmailService 
  ) {}

 async findById(id: number) {
  const user = await this.userRepo.findOne({
    where: { id },
    relations: ['role'],  
  });
  if (!user) throw new NotFoundException('User not found');
  return user;
}

async cleanUnusedAvatars() {
    const usedAvatars = await this.userRepo
      .createQueryBuilder("user")
      .select("user.avatarUrl")
      .where("user.avatarUrl IS NOT NULL")
      .getRawMany();

const usedFiles = usedAvatars.map((u) => path.basename(u.user_avatarUrl));

const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
    const filesInFolder = fs.readdirSync(avatarDir);

    const unusedFiles = filesInFolder.filter((file) => !usedFiles.includes(file));

    for (const file of unusedFiles) {
      const filePath = path.join(avatarDir, file);
      fs.unlinkSync(filePath);
      console.log(`🗑 Deleted unused avatar: ${file}`);
    }
  }


  async updateProfile(id: number, dto: UpdateProfileDto) {
    if (!id) throw new BadRequestException('User ID is required');
    if (dto.username) {
    dto.username = dto.username.trim().replace(/\s+/g, ' ');
  }
  await this.userRepo.update(id, dto);
    return this.findById(id);
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.findById(id);

    if (dto.oldPassword !== user.password) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    await this.userRepo.update(id, { password: dto.newPassword });

    return { message: 'Password updated successfully' };
  }

  async updateAvatar(id: number, newAvatarUrl: string) {
  const user = await this.userRepo.findOne({ where: { id } });

  if (user?.avatarUrl) {
    const oldPath = path.join(__dirname, '..', '..', 'uploads', 'avatars', path.basename(user.avatarUrl));
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  await this.userRepo.update(id, { avatarUrl: newAvatarUrl });
  return this.findById(id);
}

async requestPasswordReset(email: string) {
  const user = await this.userRepo.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException('User with this email not found');
  }

  await this.resetRequestRepo.delete({ user: { id: user.id } });

   const token = randomUUID();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

  const resetRequest = this.resetRequestRepo.create({
    user,
    token,
    expiresAt,
  });
  await this.resetRequestRepo.save(resetRequest);

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  const previewLink = await this.emailService.sendResetPasswordEmail(user.email, resetLink, token);


  return {
    message: `Password reset link has been sent to ${user.email}`,
    previewLink,
  };
}

  
  // ✅ Reset password using token
  async resetPassword(token: string, newPassword: string): Promise<string> {
    const resetRequest = await this.resetRequestRepo.findOne({
      where: { token },
      relations: ['user'],
      order: { expiresAt: 'DESC' },
    });
    if (!resetRequest) {
      throw new NotFoundException('Invalid or expired reset token');
    }
    if (new Date() > resetRequest.expiresAt) {
  await this.resetRequestRepo.delete({ id: resetRequest.id }); 
  throw new BadRequestException('Reset token has expired');
}

    const user = resetRequest.user;
    user.password = newPassword;

    await this.userRepo.save(user);
    await this.resetRequestRepo.delete({ id: resetRequest.id });
    return 'Password has been reset successfully';
  }
 
  
}
