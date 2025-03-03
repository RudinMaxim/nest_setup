import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserEntity } from '../entities/user.entity';
import { compare, genSalt } from 'bcryptjs';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { PasswordUpdateDto } from '../dto/password-update.dto';
import * as crypto from 'crypto';
import { unlink } from 'fs';
import { UsersRepository } from '../repositories';
import { AuthInfo, EDITABLE_FIELDS, UserOmitOptions } from '../common';
import { FilterDto, SortDto, PaginationDto, ListResponseDto } from 'src/shared/dto';
import { UserBaseDto, UserUpdateDto } from '../dto';
import { ConfigService } from '@nestjs/config';

abstract class IUsersService {
    abstract create(dto: UserCreateDto, author: AuthInfo): Promise<UserBaseDto>;
    abstract find(id: number, author?: AuthInfo): Promise<UserBaseDto>;
    abstract findMany(
        author: AuthInfo,
        filters?: FilterDto,
        sort?: SortDto,
        pagination?: PaginationDto,
        omitOptions?: UserOmitOptions,
    ): Promise<ListResponseDto<UserBaseDto> | null>;
    abstract findByEmail(email: string, omitOptions?: any): Promise<UserBaseDto | null>;
    abstract findByResetPasswordToken(token: string): Promise<UserBaseDto>;
    abstract update(id: number, dto: UserUpdateDto, author: AuthInfo): Promise<UserBaseDto>;
    abstract delete(id: number, author: AuthInfo): Promise<UserBaseDto>;
    abstract comparePassword(password: string, passwordHash: string): Promise<boolean>;
    abstract setResetPasswordToken(email: string): Promise<string>;
    abstract verifyResetPasswordToken(token: string): Promise<UserBaseDto>;
    abstract resetPassword(dto: any): Promise<UserBaseDto>;
    abstract updatePassword({
        id,
        password,
        newPassword,
    }: PasswordUpdateDto & { id: User['id'] }): Promise<UserBaseDto>;
    abstract addHostnameForUserFile(user: UserBaseDto | AuthInfo): void;
}

@Injectable()
export class UsersService implements IUsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly configService: ConfigService,
    ) {}

    async create(user: UserCreateDto, author: AuthInfo): Promise<UserBaseDto> {
        const existedUser = await this.usersRepository.findByEmail(user.email);
        if (existedUser) {
            throw new HttpException('Пользователь уже существует', HttpStatus.BAD_REQUEST);
        }

        if (
            author.role === Role.ADMIN_DEPARTMENT &&
            Number(author.departmentId) !== Number(user.departmentId)
        ) {
            throw new HttpException(
                'Невозможно создать пользователя другого отдела',
                HttpStatus.FORBIDDEN,
            );
        }

        const userData = this.sanitizeUserData(user);

        const newUser = new UserEntity(userData);
        const salt = await genSalt(Number(this.configService.get('SALT_ROUNDS')));
        await newUser.setPassword(user.password, salt);

        const createdUser = await this.usersRepository.create(newUser);
        if (!createdUser) {
            throw new HttpException('Failed to create user!', HttpStatus.UNPROCESSABLE_ENTITY);
        }

        return createdUser;
    }

    async find(id: number, author?: AuthInfo): Promise<UserBaseDto> {
        const foundUser = await this.usersRepository.find(
            id,
            this.getOmitOptionsByRole(author?.role),
        );

        if (!foundUser) throw new HttpException('User is not found!', HttpStatus.NOT_FOUND);

        if (author) {
            this.omitFieldsByAuthor(foundUser, author);
        }

        this.addHostnameForUserFile(foundUser);
        this.normalizeUserDateBirth(foundUser, author);

        return foundUser;
    }

    async findMany(
        author: AuthInfo,
        filters?: FilterDto,
        sort?: SortDto,
        pagination?: PaginationDto,
        omitOptions?: UserOmitOptions,
    ): Promise<ListResponseDto<UserBaseDto>> {
        if (author.role === Role.ADMIN_DEPARTMENT && author.departmentId) {
            filters = {
                ...filters,
                fields: {
                    ...filters?.fields,
                    departmentId: { operator: 'eq', value: author.departmentId },
                },
            };
        }

        if (author.role === Role.EMPLOYEE) {
            delete filters?.fields?.grade;
        }

        const users = await this.usersRepository.findMany(filters, sort, pagination, omitOptions);

        if (!users?.data?.length) {
            throw new HttpException('Users not found!', HttpStatus.NOT_FOUND);
        }

        users.data.forEach((user: UserBaseDto) => {
            this.omitFieldsByAuthor(user, author);
            this.addHostnameForUserFile(user);
            this.normalizeUserDateBirth(user, author);
        });

        return users;
    }

    async findByEmail(email: string, omitOptions?: UserOmitOptions): Promise<UserBaseDto> {
        const foundUser = await this.usersRepository.findByEmail(email, omitOptions);

        if (!foundUser) throw new HttpException('User is not found!', HttpStatus.NOT_FOUND);

        this.addHostnameForUserFile(foundUser);
        this.normalizeUserDateBirth(foundUser);

        return foundUser;
    }

    async findByResetPasswordToken(token: string): Promise<UserBaseDto> {
        const foundUser = await this.usersRepository.findByResetPasswordToken(token);

        if (!foundUser) throw new HttpException('User is not found!', HttpStatus.NOT_FOUND);

        return foundUser;
    }

    async update(id: number, dto: UserUpdateDto, author: AuthInfo): Promise<UserBaseDto> {
        const targetUser = await this.usersRepository.find(id);

        if (!targetUser) throw new HttpException('User to update not found!', HttpStatus.NOT_FOUND);

        if (author.role === Role.ADMIN_DEPARTMENT) {
            if (targetUser.departmentId !== author.departmentId) {
                throw new HttpException(
                    'Невозможно редактировать пользователя другого отдела',
                    HttpStatus.FORBIDDEN,
                );
            }
            if (dto.role === Role.ADMIN) {
                throw new HttpException(
                    'Недостаточно прав для создания админа',
                    HttpStatus.FORBIDDEN,
                );
            }
        }

        if ('avatar' in dto && targetUser.avatar) {
            unlink(targetUser.avatar, (err) => err && console.error(err));
        }

        const userData = this.sanitizeUserUpdateData(dto, author);
        const updatedUser = await this.usersRepository.update(id, userData);
        if (!updatedUser)
            throw new HttpException('User to update not found!', HttpStatus.NOT_FOUND);

        return updatedUser;
    }

    async delete(id: number, author: AuthInfo): Promise<UserBaseDto> {
        if (author.role === Role.ADMIN_DEPARTMENT) {
            const targetUser = await this.usersRepository.find(id);
            if (targetUser?.departmentId !== author.departmentId) {
                throw new HttpException(
                    'Невозможно удалить пользователя другого отдела',
                    HttpStatus.FORBIDDEN,
                );
            }
        }

        const deletedUser = await this.usersRepository.delete(id);

        if (!deletedUser) {
            throw new HttpException('User is not found!', HttpStatus.NOT_FOUND);
        }

        return deletedUser;
    }

    async comparePassword(password: string, passwordHash: string): Promise<boolean> {
        const isCorrectPassword = await compare(password, passwordHash);

        if (!isCorrectPassword) {
            throw new HttpException(
                'Пароль введен неверно. Попробуйте еще раз или сбросьте пароль',
                HttpStatus.BAD_REQUEST,
            );
        }

        return true;
    }

    async setResetPasswordToken(email: string): Promise<string> {
        const foundUser = await this.findByEmail(email);
        const token = crypto.randomUUID();
        const tokenExpires = new Date(Date.now() + 900000); // +15min

        foundUser.resetPasswordToken = token;
        foundUser.resetPasswordExpires = tokenExpires;

        const updatedUser = await this.usersRepository.update(foundUser.id, foundUser);

        if (!updatedUser) {
            throw new HttpException('User to update not found!', HttpStatus.NOT_FOUND);
        }

        return token;
    }

    async verifyResetPasswordToken(token: string): Promise<UserBaseDto> {
        const foundUser = await this.findByResetPasswordToken(token);
        const resetPasswordExpires = foundUser.resetPasswordExpires?.getTime();

        if (resetPasswordExpires && resetPasswordExpires < Date.now()) {
            foundUser.resetPasswordToken = null;
            foundUser.resetPasswordExpires = null;

            const updatedUser = await this.usersRepository.update(foundUser.id, foundUser);

            if (!updatedUser) {
                throw new HttpException('Failed to delete token!', HttpStatus.NOT_FOUND);
            }

            throw new HttpException(
                'The password recovery link has expired!',
                HttpStatus.UNAUTHORIZED,
            );
        }

        return foundUser;
    }

    async resetPassword({ token, password }: PasswordResetDto): Promise<UserBaseDto> {
        const verifiedUser = await this.verifyResetPasswordToken(token);

        const newUser = new UserEntity(verifiedUser);
        const salt = await genSalt(Number(this.configService.get('SALT_ROUNDS')));
        await newUser.setPassword(password, salt);

        const newUserData = {
            ...newUser,
            password: newUser.getPassword(),
            resetPasswordToken: null,
            resetPasswordExpires: null,
        };

        const updatedUser = await this.usersRepository.update(verifiedUser.id, newUserData);

        if (!updatedUser) {
            throw new HttpException('Failed to update user password!', HttpStatus.BAD_REQUEST);
        }

        return updatedUser;
    }

    async updatePassword({
        id,
        password,
        newPassword,
    }: PasswordUpdateDto & { id: User['id'] }): Promise<UserBaseDto> {
        const foundUser = await this.usersRepository.find(id, { password: false });

        if (!foundUser) throw new HttpException('User is not found!', HttpStatus.NOT_FOUND);

        await this.comparePassword(password, foundUser.password);

        const newUser = new UserEntity(foundUser);
        const salt = await genSalt(Number(this.configService.get('SALT_ROUNDS')));
        await newUser.setPassword(newPassword, salt);

        const updatedUser = await this.usersRepository.update(id, {
            ...newUser,
            password: newUser.getPassword(),
        });

        if (!updatedUser) {
            throw new HttpException('Failed to update user password!', HttpStatus.BAD_REQUEST);
        }

        return updatedUser;
    }

    public addHostnameForUserFile(user: User | AuthInfo) {
        if (!user.avatar) {
            return;
        }

        user.avatar = `${this.configService.get('HOSTNAME')}/${user.avatar}`;
    }

    private normalizeUserDateBirth(user: UserBaseDto, author?: AuthInfo) {
        if (user.id !== author?.id) {
            user.dateBirth.setFullYear(new Date().getFullYear());
        }
    }

    private getOmitOptionsByRole(role: UserBaseDto['role'] = Role.EMPLOYEE): UserOmitOptions {
        return {
            grade: role === Role.EMPLOYEE,
            telegram: role === Role.EMPLOYEE,
        };
    }

    private sanitizeUserData(dto: UserCreateDto): UserCreateDto {
        const userData = {} as Partial<UserCreateDto>;

        Object.entries(dto).forEach(([key, value]) => {
            if (key === 'departmentId' && value) {
                userData.departmentId = Number(value);
                return;
            }

            if (typeof value === 'string') {
                userData[key as keyof UserCreateDto] = value.trim() as never;
            } else {
                userData[key as keyof UserCreateDto] = value as never;
            }
        });

        return userData as UserCreateDto;
    }

    private sanitizeUserUpdateData(dto: UserUpdateDto, author: AuthInfo): UserUpdateDto {
        const userData: Partial<UserUpdateDto> = {};

        Object.entries(dto).forEach(([key, value]) => {
            if (!EDITABLE_FIELDS[author.role].includes(key as keyof UserUpdateDto)) return;

            if (key === 'departmentId' && value) {
                userData.departmentId = Number(value);
                return;
            }

            if (key === 'dateBirth' && new Date(value).getFullYear() === new Date().getFullYear()) {
                return;
            }

            if (typeof value === 'string') {
                userData[key as keyof UserCreateDto] = value.trim() as never;
            } else {
                userData[key as keyof UserCreateDto] = value as never;
            }
        });

        return userData;
    }

    private omitFieldsByAuthor(user: UserBaseDto, author: UserBaseDto | AuthInfo): void {
        const omitByRole: Record<Role, VoidFunction> = {
            [Role.EMPLOYEE]: () => {},
            [Role.ADMIN_DEPARTMENT]: () => {
                if (user.departmentId !== author.departmentId) {
                    const partialUser = user as Partial<UserBaseDto>;
                    delete partialUser.grade;
                    delete partialUser.telegram;
                }
            },
            [Role.ADMIN]: () => {},
        };
        omitByRole[author.role]();
    }
}
