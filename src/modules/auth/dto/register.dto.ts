import {
  IsEmail,
  IsNotEmpty,
  Length,
  MinLength,
  IsNumberString,
  IsString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Match } from 'src/common/decorators/match.decorator';

export class RegisterDto {
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsNotEmpty({ message: 'Phone number is required.' })
  @IsNumberString({}, { message: 'Phone number must contain only digits.' })
  @Length(10, 15, { message: 'Phone number must be between 10 to 15 digits.' })
  phone: string;

  @IsNotEmpty({ message: 'Role is required.' })
  @Type(() => Number)
  @IsInt({ message: 'Role ID must be a number.' })
  role_id: number;

  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @IsNotEmpty({ message: 'Confirm password is required.' })
  @Match('password', { message: 'Confirm password must match password.' })
  confirm_password: string;

  @IsNotEmpty({ message: 'First name is required.' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required.' })
  @IsString()
  lastName: string;
}
