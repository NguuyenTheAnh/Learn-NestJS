import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import ms from 'ms';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/interface/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
        private configService: ConfigService

    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid) return user;
        }
        return null;
    }

    async login(user: IUser, response: Response) {
        const { _id, name, email, role } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };

        const refresh_token = this.createRefreshToken(payload)
        // update user token with refresh token
        await this.usersService.updateUserToken(refresh_token, _id);

        // set cookie
        response.cookie('refresh_token', refresh_token, {
            maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
            httpOnly: true
        })

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role
            }
        };
    }

    async register(registerUserDto: RegisterUserDto) {
        // check email exist
        const isExist = await this.userModel.findOne({ email: registerUserDto.email });
        if (isExist) throw new BadRequestException('Email exists');

        const hashPassword = this.usersService.getHashPassword(registerUserDto.password);
        let user = await this.userModel.create({ ...registerUserDto, password: hashPassword, role: 'USER' });
        return {
            _id: user._id,
            createdAt: user.createdAt
        };
    }

    createRefreshToken(payload: any) {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000
        })
        return refresh_token;
    }

    async processNewToken(refreshToken: string, response: Response) {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
            });

            let user = await this.usersService.findUserByToken(refreshToken);
            if (user) {
                const { _id, name, email, role } = user;
                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                };

                const refresh_token = this.createRefreshToken(payload)
                // update user token with refresh token
                await this.usersService.updateUserToken(refresh_token, _id.toString());

                // set cookie
                response.clearCookie('refresh_token');
                response.cookie('refresh_token', refresh_token, {
                    maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
                    httpOnly: true
                })

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role
                    }
                };
            }
            else {
                throw new BadRequestException('Not found user')
            }
        } catch (error) {
            throw new BadRequestException('Refresh token invalid. Please login')
        }
    }

    async logout(user: IUser, response: Response) {
        await this.userModel.updateOne({ _id: user._id }, { refreshToken: '' });
        response.clearCookie('refresh_token');
        return 'ok';
    }
}
