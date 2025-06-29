import { IsOptional, IsString, IsEmail, Matches, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
@Matches(/^[A-Za-z\s'-]+$/, { message: "Name can only contain letters, spaces, apostrophes, and hyphens" })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;
}
