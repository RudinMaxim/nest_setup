import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { Grade, Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { FilterDto, SortOrder, PaginationDto, ListResponseDto, SortDto } from '../../../shared/dto';
import { IUser, UserOmitOptions } from '../common';

abstract class IUsersRepository {
    abstract create(user: UserEntity): Promise<IUser | null>;
    abstract find(id: number, omitOptions?: UserOmitOptions): Promise<IUser | null>;
    abstract findByEmail(email: string, omitOptions?: UserOmitOptions): Promise<IUser | null>;
    abstract findMany(
        filters?: FilterDto,
        sort?: SortDto,
        pagination?: PaginationDto,
        omitOptions?: UserOmitOptions,
    ): Promise<ListResponseDto<IUser> | null>;
    abstract findByResetPasswordToken(resetPasswordToken: string): Promise<IUser | null>;
    abstract update(id: number, user: Partial<IUser>): Promise<IUser | null>;
    abstract delete(id: number): Promise<IUser | null>;
    abstract gradeSort(sort: SortOrder, users: IUser[]): IUser[];
}

// TODO: Добавить логер
// TODO: Добавить кэширование

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

    public async create(user: UserEntity): Promise<User | null> {
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
            console.error(err);
            return null;
        }
    }

    public async find(id: number, omitOptions?: UserOmitOptions): Promise<IUser | null> {
        try {
            return await this.prismaService.user.findFirst({
                where: { id },
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

    public async findMany(
        filters?: FilterDto,
        sort?: SortDto,
        pagination?: PaginationDto,
        omitOptions?: UserOmitOptions,
    ): Promise<ListResponseDto<IUser> | null> {
        try {
            const where: Prisma.UserWhereInput = {};

            if (filters?.search) {
                where['OR'] = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { surname: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                ];
            }

            if (filters?.fields) {
                Object.entries(filters.fields).forEach(([field, fieldFilter]) => {
                    if (fieldFilter.value !== undefined) {
                        switch (fieldFilter.operator) {
                            case 'eq':
                                where[field] = { equals: fieldFilter.value };
                                break;
                            case 'ne':
                                where[field] = { not: { equals: fieldFilter.value } };
                                break;
                            case 'gt':
                                where[field] = { gt: fieldFilter.value };
                                break;
                            case 'lt':
                                where[field] = { lt: fieldFilter.value };
                                break;
                            case 'gte':
                                where[field] = { gte: fieldFilter.value };
                                break;
                            case 'lte':
                                where[field] = { lte: fieldFilter.value };
                                break;
                            case 'in':
                                where[field] = {
                                    in: Array.isArray(fieldFilter.value)
                                        ? fieldFilter.value
                                        : [fieldFilter.value],
                                };
                                break;
                            case 'nin':
                                where[field] = {
                                    notIn: Array.isArray(fieldFilter.value)
                                        ? fieldFilter.value
                                        : [fieldFilter.value],
                                };
                                break;
                            case 'like':
                                where[field] = { contains: fieldFilter.value, mode: 'insensitive' };
                                break;
                            default:
                                where[field] = { equals: fieldFilter.value };
                        }
                    }
                });
            }

            let orderBy: Prisma.UserOrderByWithRelationInput = {};

            if (sort?.field) {
                orderBy = { [sort.field]: sort.order };
            } else {
                orderBy = { surname: SortOrder.DESC };
            }

            const page = pagination?.page || 1;
            const limit = pagination?.limit || 10;
            const skip = (page - 1) * limit;

            const totalItems = await this.prismaService.user.count({ where });
            const totalPages = Math.ceil(totalItems / limit);

            const users = await this.prismaService.user.findMany({
                where,
                orderBy,
                skip,
                take: limit,
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

            return {
                data: users,
                pagination: {
                    page,
                    limit,
                    totalPages,
                    totalItems,
                },
            };
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

    public async findByResetPasswordToken(resetPasswordToken: string): Promise<IUser | null> {
        try {
            return await this.prismaService.user.findUnique({
                where: { resetPasswordToken },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async update(id: number, user: Partial<IUser>): Promise<IUser | null> {
        try {
            delete user.id;

            return await this.prismaService.user.update({
                where: { id },
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

    public async delete(id: number): Promise<IUser | null> {
        try {
            return await this.prismaService.user.delete({
                where: { id },
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
