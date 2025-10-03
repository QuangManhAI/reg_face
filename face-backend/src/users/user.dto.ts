import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, {message: " Email không hợp lệ."})
  email: string;

  @IsNotEmpty({message: " Mật khẩu không được để trống."})
  password: string;
}

export class RegisterUserDto {
  @IsEmail({}, {message: " Email không hợp lệ."})
    email: string;

  @IsNotEmpty({message: " Mật khẩu không được để trống."})
  password: string;

  @IsNotEmpty({message: " Họ và tên không được để trống."})
  fullName: string;
}