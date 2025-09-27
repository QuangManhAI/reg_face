import {Body, Controller, Post, BadRequestException} from '@nestjs/common';
import { UserService } from './users.service';
import { LoginUserDto } from './user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    async register(@Body() body: {email: string; password: string; fullName: string}) {
        const user = await this.userService.register(body.email, body.password, body.fullName);
        return {id: user._id, email: user.email, fullName: user.fullName};
    }

    @Post('login')
    async login(@Body() body: {email: string, password: string}) {
        try {
            const user = await this.userService.login(body.email, body.password);
            return {userId: user.id, step: "face_required"};
        } catch(e) {
            throw new BadRequestException(e.message);
        }
    }
}