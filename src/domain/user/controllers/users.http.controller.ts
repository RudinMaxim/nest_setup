import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    UnprocessableEntityException,
    HttpCode,
    ParseIntPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiConsumes,
    ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { ApiResponseDto, ListResponseDto, QueryParamsDto } from 'src/shared/dto';
import { AuthInfo, MIN_PASSWORD_LENGTH } from '../common';
import {
    UserCreateDto,
    UserBaseDto,
    UserUpdateDto,
    PasswordResetDto,
    PasswordUpdateDto,
} from '../dto';
import { UsersService } from '../service';
import { GetAuthInfo, Roles, RolesGuard } from 'src/domain/common';

// @ts-ignore
interface FileWithPath extends Express.Multer.File {
    path: string;
}

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Roles(Role.ADMIN, Role.ADMIN_DEPARTMENT)
    @UseGuards(RolesGuard)
    @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Создает и возвращает созданного пользователя.' })
    @ApiBody({ type: UserCreateDto })
    @ApiResponse({
        status: 201,
        description: 'Пользователь успешно создан',
        type: () => ApiResponseDto<UserBaseDto>,
    })
    @ApiResponse({ status: 400, description: 'Неверный запрос' })
    @ApiResponse({ status: 422, description: 'Ошибка обработки данных' })
    async create(
        @Body() body: UserCreateDto,
        // @ts-ignore
        @UploadedFiles() files: { avatar: Express.Multer.File[] | undefined },
        @GetAuthInfo() authInfo: AuthInfo,
    ): Promise<UserBaseDto> {
        try {
            const avatarFile = files?.avatar?.[0] as FileWithPath;

            const userDTO = avatarFile?.path ? { ...body, avatar: avatarFile.path } : body;

            return await this.usersService.create(userDTO, authInfo);
        } catch (err) {
            if (err instanceof Error && err.message === 'Пользователь уже существует') {
                throw new BadRequestException(err.message);
            }
            if (
                err instanceof Error &&
                err.message === 'Невозможно создать пользователя другого отдела'
            ) {
                throw new ForbiddenException(err.message);
            }
            if (err instanceof Error && err.message === 'Failed to create user!') {
                throw new UnprocessableEntityException(err.message);
            }
            throw err;
        }
    }

    @Get('profile')
    @ApiOperation({ summary: 'Возвращает информацию по текущему пользователю' })
    @ApiResponse({
        status: 200,
        description: 'Информация о текущем пользователе',
        type: () => ApiResponseDto<UserBaseDto>,
    })
    profile(@GetAuthInfo() authInfo: AuthInfo): AuthInfo {
        this.usersService.addHostnameForUserFile(authInfo);
        return authInfo;
    }

    @Get(':id')
    @ApiOperation({ summary: 'Находит и возвращает пользователя по ID.' })
    @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
    @ApiResponse({
        status: 200,
        description: 'Пользователь найден',
        type: () => ApiResponseDto<UserBaseDto>,
    })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    async find(
        @Param('id', ParseIntPipe) id: number,
        @GetAuthInfo() authInfo: AuthInfo,
    ): Promise<UserBaseDto> {
        try {
            return await this.usersService.find(id, authInfo);
        } catch (err) {
            if (err instanceof Error && err.message === 'User is not found!') {
                throw new NotFoundException('Пользователь не найден');
            }
            throw err;
        }
    }

    @Get()
    @ApiOperation({
        summary: 'Находит и возвращает всех пользователей с фильтрацией и сортировкой.',
    })
    @ApiQuery({
        name: 'departmentId',
        required: false,
        description: 'Поиск пользователей по конкретному отделу',
    })
    @ApiQuery({
        name: 'name',
        required: false,
        description: 'Поиск пользователей по полному имени',
    })
    @ApiQuery({ name: 'post', required: false, description: 'Поиск пользователей по должности' })
    @ApiQuery({
        name: 'departmentName',
        required: false,
        description: 'Поиск пользователей по названию отдела',
    })
    @ApiQuery({
        name: 'grade',
        required: false,
        isArray: true,
        description: 'Поиск пользователей по грейду',
    })
    @ApiQuery({
        name: 'surnameSort',
        required: false,
        enum: ['desc', 'asc'],
        description: 'Сортировка пользователей по фамилии',
    })
    @ApiQuery({
        name: 'departmentSort',
        required: false,
        enum: ['desc', 'asc'],
        description: 'Сортировка пользователей по названию отдела',
    })
    @ApiQuery({
        name: 'gradeSort',
        required: false,
        enum: ['desc', 'asc'],
        description: 'Сортировка пользователей по грейду',
    })
    @ApiQuery({
        name: 'experienceSort',
        required: false,
        enum: ['desc', 'asc'],
        description: 'Сортировка пользователей по опыту',
    })
    @ApiQuery({
        name: 'postSort',
        required: false,
        enum: ['desc', 'asc'],
        description: 'Сортировка пользователей по должности',
    })
    @ApiResponse({
        status: 200,
        description: 'Список пользователей',
        type: () => ApiResponseDto<ListResponseDto<UserBaseDto>>,
    })
    @ApiResponse({ status: 404, description: 'Пользователи не найдены' })
    async findAllAndFilter(
        @Query() queryParams: QueryParamsDto,
        @GetAuthInfo() authInfo: AuthInfo,
    ): Promise<ListResponseDto<UserBaseDto>> {
        try {
            return await this.usersService.findMany(
                authInfo,
                queryParams.filter,
                queryParams.sort,
                queryParams.pagination,
            );
        } catch (err) {
            if (err instanceof Error && err.message === 'Users not found!') {
                throw new NotFoundException('Пользователи не найдены');
            }
            throw err;
        }
    }

    @Put(':id')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Обновляет и возвращает обновленного пользователя по ID.' })
    @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
    @ApiBody({ type: UserUpdateDto })
    @ApiResponse({
        status: 200,
        description: 'Пользователь обновлен',
        type: () => ApiResponseDto<UserBaseDto>,
    })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UserUpdateDto,
        // @ts-ignore
        @UploadedFiles() files: { avatar?: Express.Multer.File[] },
        @GetAuthInfo() authInfo: AuthInfo,
    ): Promise<UserBaseDto> {
        try {
            const avatarFile = files?.avatar?.[0] as FileWithPath;
            const userDTO = avatarFile
                ? {
                      ...body,
                      avatar: avatarFile.path,
                  }
                : body;

            return await this.usersService.update(Number(id), userDTO, authInfo);
        } catch (err) {
            if (err instanceof Error && err.message === 'User to update not found!') {
                throw new NotFoundException('Пользователь не найден');
            }
            if (
                (err instanceof Error &&
                    err.message === 'Невозможно редактировать пользователя другого отдела') ||
                (err instanceof Error && err.message === 'Недостаточно прав для создания админа')
            ) {
                throw new ForbiddenException(err.message);
            }
            throw err;
        }
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.ADMIN_DEPARTMENT)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Удаляет и возвращает данные удаленного пользователя по ID.' })
    @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
    @ApiResponse({
        status: 200,
        description: 'Пользователь удален',
        type: () => ApiResponseDto<UserBaseDto>,
    })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @GetAuthInfo() authInfo: AuthInfo,
    ): Promise<UserBaseDto> {
        try {
            return await this.usersService.delete(id, authInfo);
        } catch (err) {
            if (err instanceof Error && err.message === 'User is not found!') {
                throw new NotFoundException('Пользователь не найден');
            }
            if (
                err instanceof Error &&
                err.message === 'Невозможно удалить пользователя другого отдела'
            ) {
                throw new ForbiddenException(err.message);
            }
            throw err;
        }
    }

    @Post('reset-password')
    @HttpCode(200)
    @ApiOperation({ summary: 'Обновляет пароль пользователя.' })
    @ApiBody({ type: PasswordResetDto })
    @ApiResponse({ status: 200, description: 'Пароль обновлен' })
    @ApiResponse({ status: 400, description: 'Неверный запрос' })
    @ApiResponse({ status: 401, description: 'Неавторизован' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    async resetPassword(@Body() body: PasswordResetDto): Promise<void> {
        try {
            await this.usersService.resetPassword(body);
        } catch (err) {
            if (err instanceof Error && err.message === 'User is not found!') {
                throw new NotFoundException('Пользователь не найден');
            }
            if (err instanceof Error && err.message === 'The password recovery link has expired!') {
                throw new BadRequestException(
                    'Срок действия ссылки для восстановления пароля истек',
                );
            }
            if (err instanceof Error && err.message === 'Failed to update user password!') {
                throw new BadRequestException('Не удалось обновить пароль пользователя');
            }
            throw err;
        }
    }

    @Post('update-password')
    @ApiOperation({ summary: 'Обновляет пароль текущего пользователя.' })
    @ApiBody({ type: PasswordUpdateDto })
    @ApiResponse({
        status: 200,
        description: 'Пароль обновлен',
        type: () => ApiResponseDto<{ message: string }>,
    })
    @ApiResponse({ status: 400, description: 'Неверный запрос' })
    @ApiResponse({ status: 401, description: 'Неавторизован' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    async updatePassword(
        @Body() body: PasswordUpdateDto,
        @GetAuthInfo() authInfo: AuthInfo,
    ): Promise<{ message: string }> {
        try {
            if (body.newPassword.length < MIN_PASSWORD_LENGTH) {
                throw new BadRequestException('Пароль должен состоять минимум из 8 символов');
            }

            await this.usersService.updatePassword({
                ...body,
                id: Number(authInfo.id),
            });

            return { message: 'Вы успешно изменили свой пароль!' };
        } catch (err) {
            if (err instanceof Error && err.message === 'User is not found!') {
                throw new NotFoundException('Пользователь не найден');
            }
            if (err instanceof Error && err.message === 'Failed to update user password!') {
                throw new BadRequestException('Не удалось обновить пароль пользователя');
            }
            throw err;
        }
    }

    @Get('format')
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Форматирует данные пользователей (только для администраторов)' })
    @ApiResponse({ status: 200, description: 'Данные отформатированы' })
    async format(@Query() query: QueryParamsDto): Promise<string> {
        try {
            const fakeAdmin = { role: Role.ADMIN } as AuthInfo;
            const users = await this.usersService.findMany(
                fakeAdmin,
                query.filter,
                query.sort,
                query.pagination,
            );

            await Promise.all(
                users.data.map(async (user: UserBaseDto) => {
                    try {
                        const userData: Record<string, string> = {};

                        Object.entries(user).forEach(([key, value]) => {
                            if (typeof value === 'string' && key !== 'avatar') {
                                userData[key] = value.trim();
                            }
                        });

                        if (Object.keys(userData).length > 0) {
                            await this.usersService.update(
                                user.id,
                                userData as unknown as Partial<UserBaseDto>,
                                fakeAdmin as UserBaseDto,
                            );
                        }
                    } catch (e) {
                        console.error(`Ошибка при обработке пользователя ID=${user.id}:`, e);
                    }
                }),
            );

            return 'ok';
        } catch (err) {
            console.error('Ошибка при форматировании данных пользователей:', err);
            throw err;
        }
    }
}
