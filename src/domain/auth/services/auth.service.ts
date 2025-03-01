import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from '../dto';
import { JWTService } from './jwt.service';
import { UsersService } from '../../users/services/users.service';

type TAuthData = {
    id: string;
    accessToken: string;
};

interface IAuthService {
    login(dto: AuthDto): Promise<TAuthData>;
}

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        private readonly jwtService: JWTService,
        private readonly usersService: UsersService,
    ) {}

    async login({ email, password }: AuthDto): Promise<TAuthData> {
        try {
            const user = await this.usersService.findBy('email', email);

            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }

            await this.usersService.comparePassword(password, user.password);

            const accessToken = await this.jwtService.signToken(email);

            return {
                id: user.id,
                accessToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}
