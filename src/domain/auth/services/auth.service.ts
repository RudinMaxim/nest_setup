import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from '../dto/auth.dto';
import { IAuthData } from '../common/auth.type';
import { UsersService } from 'src/domain/user/service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    async login({ email, password }: AuthDto): Promise<IAuthData> {
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
