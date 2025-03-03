import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Param,
    Req,
    Res,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthDto } from '../dto/auth.dto';
import { PasswordForgotDto } from '../dto/password-forgot.dto';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { UsersService } from 'src/domain/user/service';
import { MailerService } from 'src/infrastructure/mailer/mailer.service';
import { AuthService } from '../services';

@ApiTags('Авторизация')
@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {}

    @Post('login')
    @ApiOperation({ summary: 'Возвращает объект, содержащий данные пользователя и токен доступа.' })
    @ApiResponse({
        status: 200,
        description: 'Возвращает объект, содержащий id пользователя и токен доступа.',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    async login(@Body() authDto: AuthDto) {
        return this.authService.login(authDto);
    }

    @Post('forgot')
    @ApiOperation({
        summary: 'Отправляет пользователю email со ссылкой для восстановления пароля.',
    })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    async sendPasswordRecoveryEmail(
        @Body() passwordForgotDto: PasswordForgotDto,
        @Req() req: Request,
    ) {
        const { email } = passwordForgotDto;
        const token = await this.usersService.setResetPasswordToken(email);
        const protocol = req.protocol;
        const host = req.headers.host;
        const recoveryURL = `${protocol}://${host}/forgot/${token}`;

        await this.mailerService.sendMail(
            email,
            'Восстановление пароля Only HRM',
            `
          <p>Ваша ссылка для восстановления пароля (действительна 15 мин.):</p>
          <p><a href=${recoveryURL} target="_blank">${recoveryURL}</a></p>
        `,
        );
    }

    @Get('forgot/:token')
    async redirectToPasswordRecoveryPage(@Param('token') token: string, @Res() res: Response) {
        try {
            await this.usersService.verifyResetPasswordToken(token);
            return res.redirect(`${this.configService.get('PASSWORD_RECOVERY_PAGE')}/${token}`);
        } catch (err) {
            console.error(err);
            const passwordForgotPage = this.configService.get<string>('PASSWORD_FORGOT_PAGE');
            if (passwordForgotPage) {
                return res.redirect(passwordForgotPage);
            } else {
                throw new Error('PASSWORD_FORGOT_PAGE is not defined');
            }
        }
    }

    @Get('protected')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Создан в качестве примера защищенного эндпойнта. Позже должен быть удален.',
        description: `
        __Защищенный эндпойнт!__
        
        Чтобы получить доступ, нужно:
        - Создать пользователя (если он не создан) при помощи эндпойнта __post: "/users"__.
        - При помощи эндпойнта __"/login"__ получить токен доступа.
        - Нажать кнопку __"Authorize"__, которая находится выше (под заголовком страницы справа), либо на иконку __"замок"__ (справа в заголовке эндпойнта) , ввести значения токена и авторизоваться.
      `,
    })
    @ApiResponse({
        status: 200,
        description: 'Success',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    protected() {
        return { success: true };
    }

    @Get('error')
    error() {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
