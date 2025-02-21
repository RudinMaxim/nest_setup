import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseRepository, CacheRepository } from '../repositories';
import { CreateExampleDto, UpdateExampleDto, PaginationExampleDto } from '../dto';
import { Example } from '../entities/example.entity';

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

    async findAll(pagination: PaginationExampleDto): Promise<Example[]> {
        return this.dbRepo.findAll({
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit,
        });
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
        const example = await this.dbRepo.update(id, dto);
        await this.cacheRepo.set(id, JSON.stringify(example));
        return example;
    }

    async delete(id: number): Promise<void> {
        await this.dbRepo.delete(id);
        await this.cacheRepo.del(id);
        await this.cacheRepo.flushPattern('example:*');
    }
}
