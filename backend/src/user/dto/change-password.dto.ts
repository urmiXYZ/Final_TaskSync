import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Old password must be a string' })
  @MinLength(6, { message: 'Old password must be at least 6 characters' })
  oldPassword: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  @MaxLength(32, { message: 'New password must be at most 32 characters' })
  newPassword: string;
}
