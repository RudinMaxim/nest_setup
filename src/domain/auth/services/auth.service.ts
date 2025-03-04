import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from '../dto';
import { IAuthData, UsersService } from '../common';

abstract class IAuthService {
    abstract login(data: AuthDto): Promise<IAuthData>;
}

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    public async login({ email, password }: AuthDto): Promise<IAuthData> {
        const { id, password: foundUserPassword } = await this.usersService.findByEmail(email, {
            password: true,
        });

        const isPasswordValid = await this.usersService.comparePassword(
            password,
            foundUserPassword,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = this.jwtService.sign({ email });

        return {
            id,
            accessToken,
        };
    }
}
