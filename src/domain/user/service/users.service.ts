import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Role, User, Grade } from '@prisma/client';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserEntity } from '../entities/user.entity';
import { compare, genSalt } from 'bcryptjs';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { PasswordUpdateDto } from '../dto/password-update.dto';
import * as crypto from 'crypto';
import { unlink } from 'fs';
import { UsersRepository } from '../repositories';
import { AuthInfo, EDITABLE_FIELDS, IUser, UserOmitOptions } from '../common';
import { FilterDto, SortDto, PaginationDto, ListResponseDto } from 'src/shared/dto';
import { UserUpdateDto } from '../dto';

abstract class IUsersService {
    abstract create(dto: any, author: AuthInfo): Promise<User>;
    abstract find(id: number, author?: AuthInfo): Promise<User>;
    abstract findMany(
        filters?: FilterDto,
        sort?: SortDto,
        pagination?: PaginationDto,
        omitOptions?: UserOmitOptions,
    ): Promise<ListResponseDto<IUser> | null>;
    abstract findByEmail(email: string, omitOptions?: any): Promise<User>;
    abstract findByResetPasswordToken(token: string): Promise<User>;
    abstract update(id: number, dto: any, author: AuthInfo): Promise<User>;
    abstract delete(id: number, author: AuthInfo): Promise<User>;
    abstract comparePassword(password: string, passwordHash: string): Promise<boolean>;
    abstract setResetPasswordToken(email: string): Promise<string>;
    abstract verifyResetPasswordToken(token: string): Promise<User>;
    abstract resetPassword(dto: any): Promise<User>;
    abstract updatePassword(dto: any): Promise<User>;
    abstract addHostnameForUserFile(user: User | AuthInfo): void;
}

@Injectable()
export class UsersService implements IUsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async create(dto: UserCreateDto, author: AuthInfo): Promise<User> {
        const existedUser = await this.usersRepository.findByEmail(dto.email);

        if (existedUser) {
            throw new HttpException('Пользователь уже существует', HttpStatus.BAD_REQUEST);
        }

        if (
            author.role === Role.ADMIN_DEPARTMENT &&
            Number(author.departmentId) !== Number(dto.departmentId)
        ) {
            throw new HttpException(
                'Невозможно создать пользователя другого отдела',
                HttpStatus.FORBIDDEN,
            );
        }

        const userData: UserCreateDto = <UserCreateDto>{};

        Object.keys(dto).forEach((key: keyof UserUpdateDto) => {
            if (key === 'departmentId' && !!dto.departmentId) {
                userData.departmentId = Number(dto.departmentId);
                return;
            }

            // @ts-ignore
            userData[key] = typeof dto[key] === 'string' ? dto[key].trim() : dto[key];
        });

        const newUser = new UserEntity(userData);
        const salt = await genSalt(Number(this.configService.get('SALT_ROUNDS')));

        await newUser.setPassword(dto.password, salt);

        const createdUser = await this.usersRepository.create(newUser);

        if (!createdUser) {
            throw new HttpException('Failed to create user!', HttpStatus.UNPROCESSABLE_ENTITY);
        }

        return createdUser;
    }

    async find(id: number, author?: AuthInfo): Promise<User> {
        const omitOptions = this.getOmitOptionsByRole(author?.role);
        const foundUser = await this.usersRepository.find(id, omitOptions);

        if (!foundUser) {
            throw new HttpException('User is not found!', HttpStatus.NOT_FOUND);
        }

        this.omitFieldsByAuthor(foundUser, author);
        this.addHostnameForUserFile(foundUser);
        this.normalizeUserDateBirth(foundUser, author);

        return foundUser;
    }

    async findAllAndFilter(filters?: any, author?: AuthInfo): Promise<User[]> {
        const omitOptions = this.getOmitOptionsByRole(author?.role);
        const searchFields: string[] = ['name', 'surname', 'patronymic', 'post'];

        if (author.role === Role.ADMIN && filters?.search?.toUpperCase() in Grade) {
            searchFields.push('grade');
            filters.search = filters.search.toUpperCase();
        }

        // При попытке получить инфу о грейдах, админ отдела принудительно получит инфу только о своем отделе
        if (author.role === Role.ADMIN_DEPARTMENT) {
            if (!('departmentId' in filters) && 'gradeSort' in filters) {
                filters.departmentId = author.departmentId;
            }
        }

        // При попытке сотрудником применить фильтры к грейдам, эти фильтры будут удалены перед запросом к БД
        if (author.role === Role.EMPLOYEE) {
            delete filters.gradeSort;
        }

        const foundUsers = await this.usersRepository.findAllAndFilter(
            filters,
            omitOptions,
            searchFields,
        );

        if (!foundUsers) {
            throw new HttpException('Users not found!', HttpStatus.NOT_FOUND);
        }

        foundUsers.forEach((user) => {
            this.omitFieldsByAuthor(user, author);
            this.addHostnameForUserFile(user);
            this.normalizeUserDateBirth(user, author);
        });

        return foundUsers;
    }

    async findByEmail(email: string, omitOptions?: UserOmitOptions): Promise<User> {
        const foundUser = await this.usersRepository.findByEmail(email, omitOptions);

        if (!foundUser) {
            throw new HttpException(
                'The user with the specified email does not exist!',
                HttpStatus.NOT_FOUND,
            );
        }

        this.addHostnameForUserFile(foundUser);
        this.normalizeUserDateBirth(foundUser);

        return foundUser;
    }

    async findByResetPasswordToken(token: string): Promise<User> {
        const foundUser = await this.usersRepository.findByResetPasswordToken(token);

        if (!foundUser) {
            throw new HttpException(
                'The user with the specified token does not exist!',
                HttpStatus.NOT_FOUND,
            );
        }

        return foundUser;
    }

    async update(id: number, dto: UserUpdateDto, author: AuthInfo): Promise<User> {
        const targetUser = await this.usersRepository.find(id);

        if (author.role === Role.ADMIN_DEPARTMENT) {
            if (targetUser?.departmentId !== author.departmentId) {
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
            unlink(targetUser.avatar, (err) => {
                if (err) console.error(err);
            });
        }

        const userData: Partial<IUser> = {};

        Object.keys(dto).forEach((key: keyof UserUpdateDto) => {
            // Удаление недопустимых полей из редактирования в зависимости от роли пользователя
            if (!EDITABLE_FIELDS[author.role].includes(key)) {
                return;
            }
            if (key === 'departmentId' && !!dto.departmentId) {
                userData.departmentId = Number(dto.departmentId);
                return;
            }

            if (
                key === 'dateBirth' &&
                new Date(dto.dateBirth).getFullYear() === new Date().getFullYear()
            ) {
                return;
            }

            // @ts-ignore
            userData[key] = typeof dto[key] === 'string' ? dto[key].trim() : dto[key];
        });

        const updatedUser = await this.usersRepository.update(id, userData);

        if (!updatedUser) {
            throw new HttpException('User to update not found!', HttpStatus.NOT_FOUND);
        }

        return updatedUser;
    }

    async delete(id: number, author: AuthInfo): Promise<User> {
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

    async verifyResetPasswordToken(token: string): Promise<User> {
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

    async resetPassword({ token, password }: PasswordResetDto): Promise<User> {
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
    }: PasswordUpdateDto & { id: User['id'] }): Promise<User> {
        const foundUser = await this.usersRepository.find(id, { password: false });

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

    private normalizeUserDateBirth(user: User, author?: User | AuthInfo) {
        if (user.id !== author?.id) {
            user.dateBirth.setFullYear(new Date().getFullYear());
        }
    }

    private getOmitOptionsByRole(role: User['role'] = Role.EMPLOYEE): UserOmitOptions {
        return {
            grade: role === Role.EMPLOYEE,
            telegram: role === Role.EMPLOYEE,
        };
    }

    private omitFieldsByAuthor(user: User, author: User | AuthInfo): void {
        const omitByRole: Record<Role, VoidFunction> = {
            [Role.EMPLOYEE]: () => {},
            [Role.ADMIN_DEPARTMENT]: () => {
                if (user.departmentId !== author.departmentId) {
                    delete user.grade;
                    delete user.telegram;
                }
            },
            [Role.ADMIN]: () => {},
            CEO: () => {},
        };
        omitByRole[author.role]();
    }
}
