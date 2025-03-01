import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { Grade } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { FilterDto, SortOrder, PaginationDto, ListResponseDto } from 'src/shared/dto';
import { PasswordResetDto } from '../dto';
import { IUser, UserOmitOptions, usersFilters } from '../common';

interface IUsersRepository {
    create(user: UserEntity): Promise<IUser | null>;
    find(uuid: string, omitOptions?: UserOmitOptions): Promise<IUser | null>;
    findByEmail(email: string, omitOptions?: UserOmitOptions): Promise<IUser | null>;
    findAllAndFilter(
        filters?: FilterDto,
        pagination?: PaginationDto,
        omitOptions?: UserOmitOptions,
    ): Promise<ListResponseDto<IUser> | null>;
    findByResetPasswordToken(resetPasswordToken: PasswordResetDto): Promise<IUser | null>;
    update(uuid: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(uuid: string): Promise<IUser | null>;
    gradeSort(sort: SortOrder, users: IUser[]): IUser[];
}

// TODO: Добавить логер

@Injectable()
export class UsersRepository implements IUsersRepository {
    constructor(private prismaService: PrismaService) {}

    private gradeToNumber = Object.values(Grade).reduce<Record<Grade, number>>(
        (res, curr, index) => {
            res[curr] = index;
            return res;
        },
        {} as Record<Grade, number>,
    );

    public async create(user: UserEntity): Promise<IUser | null> {
        try {
            return await this.prismaService.user.create({
                data: {
                    ...user,
                    password: user.getPassword(),
                },
                include: {
                    department: true,
                    headOfDepartment: true,
                    certificates: true,
                    events: true,
                    eventsResponsible: true,
                },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async find(uuid: string, omitOptions?: UserOmitOptions): Promise<IUser | null> {
        try {
            return await this.prismaService.user.findFirst({
                where: { uuid },
                omit: omitOptions,
                include: {
                    department: {
                        include: {
                            head: {
                                select: {
                                    name: true,
                                    surname: true,
                                },
                            },
                        },
                    },
                    headOfDepartment: true,
                    certificates: true,
                    events: true,
                    eventsResponsible: true,
                },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public gradeSort = (sort: SortOrder, users: IUser[]): IUser[] => {
        if (sort === SortOrder.ASC) {
            users.sort((a, b) => this.gradeToNumber[a.grade] - this.gradeToNumber[b.grade]);
        } else {
            users.sort((a, b) => this.gradeToNumber[b.grade] - this.gradeToNumber[a.grade]);
        }

        return users;
    };

    public async findAllAndFilter(
        filters?: usersFilters,
        omitOptions?: UserOmitOptions,
        searchFields: string[] = [],
    ): Promise<IUser[] | null> {
        const searchWhere: Record<string, any> = {
            ...(filters?.departmentId && { departmentId: Number(filters.departmentId) }),
            ...(filters?.search && {
                OR: searchFields.map((field) => {
                    if (field === 'grade') {
                        return {
                            grade: filters.search,
                        };
                    }

                    return {
                        [field]: {
                            contains: filters.search,
                            mode: 'insensitive',
                        },
                    };
                }),
            }),
        };

        const sortOptions: Record<string, any>[] = [
            ...(filters?.surnameSort ? [{ surname: filters.surnameSort }] : []),
            ...(filters?.postSort ? [{ post: filters.postSort }] : []),
            ...(filters?.timeZoneSort ? [{ timeZone: filters.timeZoneSort }] : []),
            ...(filters?.experienceSort ? [{ dateStart: filters.experienceSort }] : []),
        ];

        try {
            const users = await this.prismaService.user.findMany({
                omit: omitOptions,
                where: searchWhere,
                orderBy: sortOptions,
                include: {
                    headOfDepartment: true,
                    department: true,
                },
            });

            if (filters?.gradeSort && [SortOrder.ASC, SortOrder.DESC].includes(filters.gradeSort)) {
                this.gradeSort(filters.gradeSort, users);
            }

            return users;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public async findByEmail(email: string, omitOptions?: UserOmitOptions): Promise<IUser | null> {
        try {
            return await this.prismaService.user.findUnique({
                where: { email },
                omit: omitOptions,
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async findByResetPasswordToken(
        resetPasswordToken: PasswordResetDto,
    ): Promise<IUser | null> {
        try {
            return await this.prismaService.user.findUnique({
                where: { resetPasswordToken },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async update(uuid: string, user: Partial<IUser>): Promise<IUser | null> {
        try {
            delete user.uuid;

            return await this.prismaService.user.update({
                where: { uuid },
                data: user,
                include: {
                    department: true,
                    headOfDepartment: true,
                    certificates: true,
                    events: true,
                    eventsResponsible: true,
                },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async delete(uuid: string): Promise<IUser | null> {
        try {
            return await this.prismaService.user.delete({
                where: { uuid },
                include: {
                    department: true,
                    headOfDepartment: true,
                    certificates: true,
                    events: true,
                    eventsResponsible: true,
                },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
