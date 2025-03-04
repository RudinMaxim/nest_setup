import { Injectable } from '@nestjs/common';
import { Grade, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma';
import { FilterDto, SortOrder, PaginationDto, ListResponseDto, SortDto } from '../../../shared/dto';
import { IUser, UserOmitOptions, UserEntity } from '../common';
import { UserBaseDto } from '../dto';

abstract class IUsersRepository {
    abstract create(user: UserEntity): Promise<UserBaseDto | null>;
    abstract find(id: number, omitOptions?: UserOmitOptions): Promise<UserBaseDto | null>;
    abstract findByEmail(email: string, omitOptions?: UserOmitOptions): Promise<UserBaseDto | null>;
    abstract findMany(
        filters?: FilterDto,
        sort?: SortDto,
        pagination?: PaginationDto,
        omitOptions?: UserOmitOptions,
    ): Promise<ListResponseDto<UserBaseDto | null>>;
    abstract findByResetPasswordToken(resetPasswordToken: string): Promise<UserBaseDto | null>;
    abstract update(id: number, user: Partial<UserBaseDto>): Promise<UserBaseDto | null>;
    abstract delete(id: number): Promise<UserBaseDto | null>;
    abstract gradeSort(sort: SortOrder, users: UserBaseDto[]): IUser[];
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

    public async create(user: UserEntity): Promise<UserBaseDto | null> {
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

    public async find(id: number, omitOptions?: UserOmitOptions): Promise<UserBaseDto | null> {
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

    public gradeSort = (sort: SortOrder, users: UserBaseDto[]): IUser[] => {
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
    ): Promise<ListResponseDto<UserBaseDto>> {
        try {
            const where: Prisma.UserWhereInput = this.buildWhereClause(filters);
            const orderBy: Prisma.UserOrderByWithRelationInput = this.buildOrderByClause(sort);

            const page = pagination?.page || 1;
            const limit = pagination?.limit || 10;
            const skip = (page - 1) * limit;

            const [totalItems, data] = await Promise.all([
                this.prismaService.user.count({ where }),
                this.prismaService.user.findMany({
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
                }),
            ]);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems,
                },
            };
        } catch (err) {
            console.error(err);
            return {
                data: [],
                pagination: {
                    page: 0,
                    limit: 0,
                    totalItems: 0,
                    totalPages: 0,
                },
            };
        }
    }

    // ! TODO: Починить типы
    private buildWhereClause(filters?: FilterDto): Prisma.UserWhereInput {
        const where: Prisma.UserWhereInput = {};

        if (filters?.search) {
            where.OR = [
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
                            // @ts-ignore
                            where[field] = { equals: fieldFilter.value };
                            break;
                        case 'ne':
                            // @ts-ignore
                            where[field] = { not: { equals: fieldFilter.value } };
                            break;
                        case 'gt':
                            // @ts-ignore
                            where[field] = { gt: fieldFilter.value };
                            break;
                        case 'lt':
                            // @ts-ignore
                            where[field] = { lt: fieldFilter.value };
                            break;
                        case 'gte':
                            // @ts-ignore
                            where[field] = { gte: fieldFilter.value };
                            break;
                        case 'lte':
                            // @ts-ignore
                            where[field] = { lte: fieldFilter.value };
                            break;
                        case 'in':
                            // @ts-ignore
                            where[field] = {
                                in: Array.isArray(fieldFilter.value)
                                    ? fieldFilter.value
                                    : [fieldFilter.value],
                            };
                            break;
                        case 'nin':
                            // @ts-ignore
                            where[field] = {
                                notIn: Array.isArray(fieldFilter.value)
                                    ? fieldFilter.value
                                    : [fieldFilter.value],
                            };
                            break;
                        case 'like':
                            // @ts-ignore
                            where[field] = { contains: fieldFilter.value, mode: 'insensitive' };
                            break;
                        default:
                            // @ts-ignore
                            where[field] = { equals: fieldFilter.value };
                    }
                }
            });
        }

        return where;
    }

    private buildOrderByClause(sort?: SortDto): Prisma.UserOrderByWithRelationInput {
        if (!sort?.field) return { surname: 'desc' };
        return { [sort.field]: sort.order };
    }

    public async findByEmail(
        email: string,
        omitOptions?: UserOmitOptions,
    ): Promise<UserBaseDto | null> {
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

    public async findByResetPasswordToken(resetPasswordToken: string): Promise<UserBaseDto | null> {
        try {
            return await this.prismaService.user.findUnique({
                where: { resetPasswordToken },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async update(id: number, user: Partial<IUser>): Promise<UserBaseDto | null> {
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

    public async delete(id: number): Promise<UserBaseDto | null> {
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
