import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateFeedbackDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}
