
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/interface/users.interface';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private rolesService: RolesService,
    ) {
        // decode token
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    // validate return data stored in req.user
    async validate(payload: IUser) {
        const { _id, name, email, role } = payload;

        // attach permissions into req.user
        const userRole = role as unknown as { _id: string; name: string }
        const temp = (await this.rolesService.findOne(userRole._id)).toObject();

        return {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? []
        };
    }

}
