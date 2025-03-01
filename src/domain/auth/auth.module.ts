import { Module } from '@nestjs/common';
import { AuthController } from './controllers';
import { AuthService, JWTService } from './services';
import { MailerModule } from '../../infrastructure/mailer/mailer.module';

@Module({
    imports: [MailerModule],
    controllers: [AuthController],
    providers: [AuthService, JWTService],
    exports: [AuthService, JWTService],
})
export class AuthModule {}
