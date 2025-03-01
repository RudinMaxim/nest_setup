import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { sign, SignOptions } from 'jsonwebtoken';
import { UsersService } from '../../users/services/users.service';
import { ConfigService } from '@nestjs/config';

export interface IJWTService {
    signToken(email: string, expiresIn?: SignOptions['expiresIn']): Promise<string>;
    getStrategy(): Strategy;
}

@Injectable()
export class JWTService implements IJWTService {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {}

    async signToken(email: string, expiresIn?: SignOptions['expiresIn']): Promise<string> {
        return new Promise((resolve, reject) => {
            sign(
                { email, iat: Math.floor(Date.now() / 1000) },
                this.configService.get<string>('JWT_SECRET'),
                {
                    expiresIn: expiresIn ?? '1d',
                },
                (err, token) => {
                    if (err) reject(err);
                    resolve(token as string);
                },
            );
        });
    }

    getStrategy(): Strategy {
        return new Strategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                ignoreExpiration: false,
                secretOrKey: this.configService.get<string>('JWT_SECRET'),
            },
            async (payload, done) => {
                const user = await this.usersService.findBy('email', payload.email);

                if (!user) return done(null, false);
                if (user) return done(null, user, user);
            },
        );
    }
}
