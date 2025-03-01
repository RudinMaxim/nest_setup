import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Res,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthDto, PasswordForgotDto } from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from '../../users/services/users.service';
import { ConfigService } from '../../../infrastructure/config/config.service';
import { MailerService } from '../../../infrastructure/mailer/mailer.service';

@ApiTags('Auth')
@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user and get access token' })
    @ApiBody({ type: AuthDto })
    @ApiResponse({
        status: 200,
        description: 'Returns user data and access token',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                accessToken: { type: 'string' },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() dto: AuthDto) {
        return this.authService.login(dto);
    }

    @Post('forgot')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send password recovery email' })
    @ApiBody({ type: PasswordForgotDto })
    @ApiResponse({ status: 200, description: 'Password recovery email sent' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async sendPasswordRecoveryEmail(@Body() dto: PasswordForgotDto, @Req() req: Request) {
        try {
            const token = await this.usersService.setResetPasswordToken(dto.email);
            const protocol = req.protocol;
            const host = req.get('host');
            const recoveryURL = `${protocol}://${host}/forgot/${token}`;

            await this.mailerService.sendMail({
                from: 'Only HRM',
                to: dto.email,
                subject: 'Восстановление пароля Only HRM',
                html: `
            <p>Ваша ссылка для восстановления пароля (действительна 15 мин.):</p>
            <p><a href=${recoveryURL} target="_blank">${recoveryURL}</a></p>
          `,
            });

            return { message: 'Password recovery email sent' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new UnauthorizedException('Failed to send recovery email');
        }
    }

    @Get('forgot/:token')
    @ApiOperation({ summary: 'Redirect to password recovery page' })
    @ApiResponse({ status: 302, description: 'Redirect to password recovery page' })
    async redirectToPasswordRecoveryPage(@Param('token') token: string, @Res() res: Response) {
        try {
            await this.usersService.verifyResetPasswordToken(token);
            return res.redirect(`${this.configService.get('PASSWORD_RECOVERY_PAGE')}/${token}`);
        } catch (error) {
            return res.redirect(this.configService.get('PASSWORD_FORGOT_PAGE'));
        }
    }

    @Get('protected')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Protected route example' })
    @ApiResponse({
        status: 200,
        description: 'Protected route accessed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    protected() {
        return { success: true };
    }
}
