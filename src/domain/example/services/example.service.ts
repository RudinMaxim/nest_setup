import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseRepository, CacheRepository } from '../repositories';
import { CreateExampleDto, UpdateExampleDto, ExampleQueryParamsDto } from '../dto';
import { Example } from '../entities/example.entity';
import { ListResponseDto } from 'src/shared/dto/list-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExampleService {
    constructor(
        private readonly dbRepo: DatabaseRepository,
        private readonly cacheRepo: CacheRepository,
    ) {}

    async create(dto: CreateExampleDto): Promise<Example> {
        const example = await this.dbRepo.create(dto);
        await this.cacheRepo.set(example.id, JSON.stringify(example));
        return example;
    }

    async findAll(queryParams: ExampleQueryParamsDto): Promise<ListResponseDto<Example>> {
        const { pagination, filter, sort } = queryParams;
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;

        const where: Prisma.ExampleWhereInput = {};

        if (queryParams.minValue !== undefined) {
            where.value = { gte: queryParams.minValue };
        }

        if (queryParams.maxValue !== undefined) {
            where.value = { gte: queryParams.maxValue };
        }

        if (filter?.search) {
            where.OR = [
                { title: { contains: filter.search, mode: 'insensitive' } },
                { description: { contains: filter.search, mode: 'insensitive' } },
            ];
        }

        const whereConditions: Record<string, any> = {};

        if (filter?.fields) {
            Object.entries(filter.fields).forEach(([field, condition]) => {
                const { operator, value } = condition;

                switch (operator) {
                    case 'eq':
                        whereConditions[field] = value;
                        break;
                    case 'ne':
                        whereConditions[field] = { not: value };
                        break;
                    case 'gt':
                        whereConditions[field] = { gt: value };
                        break;
                    case 'lt':
                        whereConditions[field] = { lt: value };
                        break;
                    case 'gte':
                        whereConditions[field] = { gte: value };
                        break;
                    case 'lte':
                        whereConditions[field] = { lte: value };
                        break;
                    case 'in':
                        whereConditions[field] = { in: Array.isArray(value) ? value : [value] };
                        break;
                    case 'nin':
                        whereConditions[field] = { notIn: Array.isArray(value) ? value : [value] };
                        break;
                    case 'like':
                        whereConditions[field] = { contains: value, mode: 'insensitive' };
                        break;
                }
            });
        }

        const orderBy: Prisma.ExampleOrderByWithRelationInput = {};
        if (sort?.field) {
            orderBy[sort.field as keyof Prisma.ExampleOrderByWithRelationInput] = sort.order;
        } else {
            orderBy.createdAt = 'desc';
        }

        const [items, totalItems] = await this.dbRepo.findAllWithCount({
            skip: (page - 1) * limit,
            take: limit,
            where: { ...where, ...whereConditions },
            orderBy,
        });

        return {
            items,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
            },
        };
    }

    async findOne(id: number): Promise<Example> {
        const cached = await this.cacheRepo.get(id);
        if (cached) return JSON.parse(cached) as Example;

        const example = await this.dbRepo.findOne(id);
        if (!example) throw new NotFoundException('Example not found');
        await this.cacheRepo.set(id, JSON.stringify(example));
        return example;
    }

    async update(id: number, dto: UpdateExampleDto): Promise<Example> {
        await this.ensureExists(id);
        const example = await this.dbRepo.update(id, dto);
        await this.cacheRepo.set(id, JSON.stringify(example));
        return example;
    }

    async delete(id: number): Promise<void> {
        await this.ensureExists(id);
        await this.dbRepo.delete(id);
        await this.cacheRepo.del(id);
    }

    async clearCache(): Promise<void> {
        await this.cacheRepo.flushPattern('example:*');
    }

    private async ensureExists(id: number): Promise<void> {
        const example = await this.dbRepo.findOne(id);
        if (!example) {
            throw new NotFoundException(`Example with id ${id} not found`);
        }
    }
}
