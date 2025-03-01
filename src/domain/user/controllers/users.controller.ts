import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    HttpException,
    HttpStatus,
    UseInterceptors,
    UploadedFiles,
    UseGuards,
    Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { UsersService } from '../services';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserUpdateDto } from '../dto/user-update.dto';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { PasswordUpdateDto } from '../dto/password-update.dto';
import { MIN_PASSWORD_LENGTH } from '../constants/users.constants';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthInfo } from '../interfaces/user.interface';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Roles(Role.ADMIN, Role.ADMIN_DEPARTMENT)
    @UseGuards(RolesGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async create(
        @Body() body: UserCreateDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Req() req: any,
    ) {
        const avatarFile = files?.find((file) => file.fieldname === 'avatar');
        const userDTO = avatarFile
            ? {
                  ...body,
                  avatar: avatarFile.path,
              }
            : body;

        return this.usersService.create(userDTO, req.authInfo);
    }

    @Get('profile')
    async profile(@Req() req: any) {
        this.usersService.addHostnameForUserFile(req.authInfo);
        return req.authInfo;
    }

    @Get(':id')
    async find(@Param('id') id: string, @Req() req: any) {
        return this.usersService.find(Number(id), req.authInfo);
    }

    @Get()
    async findAllAndFilter(@Query() query: any, @Req() req: any) {
        return this.usersService.findAllAndFilter(query, req.authInfo);
    }

    @Put(':id')
    @UseInterceptors(FilesInterceptor('files'))
    async update(
        @Param('id') id: string,
        @Body() body: UserUpdateDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Req() req: any,
    ) {
        const avatarFile = files?.find((file) => file.fieldname === 'avatar');
        const userDTO = avatarFile
            ? {
                  ...body,
                  avatar: avatarFile.path,
              }
            : body;

        return this.usersService.update(Number(id), userDTO, req.authInfo);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.ADMIN_DEPARTMENT)
    @UseGuards(RolesGuard)
    async delete(@Param('id') id: string, @Req() req: any) {
        return this.usersService.delete(Number(id), req.authInfo);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: PasswordResetDto) {
        await this.usersService.resetPassword(body);
        return { success: true };
    }

    @Post('update-password')
    async updatePassword(@Body() body: PasswordUpdateDto, @Req() req: any) {
        if (body.newPassword.length < MIN_PASSWORD_LENGTH) {
            throw new HttpException(
                'Пароль должен состоят минимум из 8 символов',
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.usersService.updatePassword({
            ...body,
            id: Number(req.authInfo.id),
        });

        return { message: 'Вы успешно изменили свой пароль!' };
    }

    @Get('format')
    async format(@Query() query: any) {
        const fakeAdmin = { role: Role.ADMIN } as AuthInfo;
        const users = await this.usersService.findAllAndFilter(query, fakeAdmin);

        for (const user of users) {
            try {
                const userData: any = {};
                Object.keys(user).forEach((key) => {
                    const value = user[key];
                    if (typeof value === 'string' && key !== 'avatar') {
                        userData[key] = value.trim();
                    }
                });
                await this.usersService.update(user.id, userData, fakeAdmin);
            } catch (e) {
                console.error(e);
            }
        }
        return 'ok';
    }
}
