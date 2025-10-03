import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { RegisterUserDto, LoginUserDto } from "./user.dto";
import { UserService } from "./users.service";
import { AuthService } from "src/auth/auth.service";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user  = await this.userService.register(dto.email, dto.password, dto.fullName);
    return { id: user._id, email: user.email, fullName: user.fullName };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    try {
      const user = await this.userService.login(dto.email, dto.password);
      return { userId: user.id, step: user.step, accessToken: user.accessToken};
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
