import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/interface/users.interface';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    @ResponseMessage('User Login')
    @UseGuards(LocalAuthGuard)
    handleLogin(
        @Req() req: any,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.login(req.user, response);
    }

    @Public()
    @ResponseMessage('Register a new user')
    @Post('register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    @Get('account')
    @ResponseMessage('Get user information')
    handleGetAccount(@User() user: IUser) { return user }

    @Public()
    @Get('refresh')
    @ResponseMessage('Get User by refresh token')
    handleRefreshToken(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = request.cookies['refresh_token'];
        return this.authService.processNewToken(refreshToken, response);
    }

    @ResponseMessage('Logout User')
    @Post('logout')
    async handleLogout(
        @User() user: IUser,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.logout(user, response);
    }

}
