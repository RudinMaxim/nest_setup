import { Injectable, Inject } from '@nestjs/common';
import { Department, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DepartmentList, DepartmentEntity } from '../common';
import { ListResponseDto, PaginationDto, SortDto } from '../../../shared/dto';
import { DepartmentBaseDto } from '../dto';

export abstract class IDepartmentsRepository {
    abstract create(department: DepartmentEntity): Promise<Department | null>;
    abstract findMany(
        pagination?: PaginationDto,
        sort?: SortDto,
    ): Promise<ListResponseDto<DepartmentBaseDto> | null>;
    abstract find(id: number): Promise<DepartmentList | null>;
    abstract update(id: number, department: Partial<Department>): Promise<Department | null>;
    abstract delete(id: number): Promise<Department | null>;
}

// TODO: Добавить логер
// TODO: Добавить кэширование

@Injectable()
export class DepartmentsRepository implements IDepartmentsRepository {
    constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

    async create(department: DepartmentEntity): Promise<Department | null> {
        try {
            return await this.prismaService.department.create({
                data: {
                    ...department,
                    members: department.connectMembers(),
                },
                include: {
                    head: true,
                    members: true,
                    competence: true,
                    documents: true,
                    events: true,
                },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async findMany(
        pagination?: PaginationDto,
        sort?: SortDto,
    ): Promise<ListResponseDto<DepartmentBaseDto> | null> {
        try {
            const orderBy: Prisma.DepartmentOrderByWithRelationInput =
                this.buildOrderByClause(sort);

            const page = pagination?.page || 1;
            const limit = pagination?.limit || 10;
            const skip = (page - 1) * limit;

            const [totalItems, data] = await Promise.all([
                this.prismaService.department.count(),
                this.prismaService.department.findMany({
                    orderBy,
                    skip,
                    take: limit,
                    include: {
                        members: true,
                        head: true,
                    },
                }),
            ]);

            const departmentList = data.map((item) => {
                return {
                    ...item,
                    members: item.members.length,
                };
            }) as DepartmentList[];

            return {
                data: departmentList,
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

    private buildOrderByClause(sort?: SortDto): Prisma.DepartmentOrderByWithRelationInput {
        if (!sort?.field) return { name: 'asc' };
        return { [sort.field]: sort.order };
    }

    async find(id: number): Promise<DepartmentList | null> {
        try {
            const department = await this.prismaService.department.findFirst({
                where: { id },
                include: {
                    head: true,
                    members: true,
                },
            });

            if (!department) {
                return null;
            }

            return {
                ...department,
                members: department.members.length,
            };
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async update(id: number, department: Partial<Department>): Promise<Department | null> {
        try {
            return await this.prismaService.department.update({
                where: { id },
                data: department,
                include: {
                    head: true,
                    members: true,
                    competence: true,
                    documents: true,
                    events: true,
                },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async delete(id: number): Promise<Department | null> {
        try {
            return await this.prismaService.department.delete({
                where: { id },
                include: {
                    head: true,
                    members: true,
                    competence: true,
                    documents: true,
                    events: true,
                },
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
