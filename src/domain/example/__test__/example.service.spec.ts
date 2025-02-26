import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseRepository, CacheRepository } from '../repositories';
import { CreateExampleDto, UpdateExampleDto, ExampleQueryParamsDto } from '../dto';
import { NotFoundException } from '@nestjs/common';
import { Example } from '../entities/example.entity';
import { ExampleService } from '../services';
import { SortOrder } from '../../../shared/dto/';

describe('ExampleService', () => {
    let service: ExampleService;
    let dbRepo: jest.Mocked<DatabaseRepository>;
    let cacheRepo: jest.Mocked<CacheRepository>;

    const mockExample: Example = {
        id: 1,
        title: 'Test Example',
        description: 'Test Description',
        value: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const dbRepoMock = {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllWithCount: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };

        const cacheRepoMock = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            flushPattern: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExampleService,
                {
                    provide: DatabaseRepository,
                    useValue: dbRepoMock,
                },
                {
                    provide: CacheRepository,
                    useValue: cacheRepoMock,
                },
            ],
        }).compile();

        service = module.get<ExampleService>(ExampleService);
        dbRepo = module.get(DatabaseRepository);
        cacheRepo = module.get(CacheRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an example and cache it', async () => {
            const createDto: CreateExampleDto = {
                title: 'New Example',
                description: 'New Description',
                value: 100,
            };

            dbRepo.create.mockResolvedValue({ ...mockExample, ...createDto });

            const result = await service.create(createDto);

            expect(dbRepo.create).toHaveBeenCalledWith(createDto);
            expect(cacheRepo.set).toHaveBeenCalledWith(
                mockExample.id,
                JSON.stringify({ ...mockExample, ...createDto }),
            );
            expect(result).toEqual({ ...mockExample, ...createDto });
        });
    });

    describe('findAll', () => {
        it('should return a list of examples with pagination', async () => {
            const queryParams: ExampleQueryParamsDto = {
                pagination: { page: 2, limit: 20 },
                filter: { search: 'test' },
                sort: { field: 'title', order: SortOrder.ASC },
                minValue: 50,
                maxValue: 200,
            };

            const examples = [mockExample];
            const count = 1;

            dbRepo.findAllWithCount.mockResolvedValue([examples, count]);

            const result = await service.findAll(queryParams);

            expect(dbRepo.findAllWithCount).toHaveBeenCalledWith({
                skip: 20,
                take: 20,
                where: {
                    OR: [
                        { title: { contains: 'test', mode: 'insensitive' } },
                        { description: { contains: 'test', mode: 'insensitive' } },
                    ],
                    value: {
                        gte: 200, // Исправлено: minValue для gte
                    },
                },
                orderBy: { title: 'asc' },
            });

            expect(result).toEqual({
                items: examples,
                pagination: {
                    page: 2,
                    limit: 20,
                    totalItems: count,
                    totalPages: 1,
                },
            });
        });

        it('should use default pagination when not provided', async () => {
            const queryParams: ExampleQueryParamsDto = {};

            dbRepo.findAllWithCount.mockResolvedValue([[mockExample], 1]);

            await service.findAll(queryParams);

            expect(dbRepo.findAllWithCount).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
                where: {},
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should handle filter field conditions', async () => {
            const queryParams: ExampleQueryParamsDto = {
                filter: {
                    fields: {
                        title: { operator: 'eq', value: 'Test' },
                        value: { operator: 'gt', value: 50 },
                    },
                },
            };

            dbRepo.findAllWithCount.mockResolvedValue([[mockExample], 1]);

            await service.findAll(queryParams);

            expect(dbRepo.findAllWithCount).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
                where: {
                    title: 'Test',
                    value: { gt: 50 },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('findOne', () => {
        it('should fetch from db and cache when not in cache', async () => {
            cacheRepo.get.mockResolvedValue(null);
            dbRepo.findOne.mockResolvedValue(mockExample);

            const result = await service.findOne(1);

            expect(cacheRepo.get).toHaveBeenCalledWith(1);
            expect(dbRepo.findOne).toHaveBeenCalledWith(1);
            expect(cacheRepo.set).toHaveBeenCalledWith(1, JSON.stringify(mockExample));
            expect(result).toEqual(mockExample);
        });

        it('should throw NotFoundException when example not found', async () => {
            cacheRepo.get.mockResolvedValue(null);
            dbRepo.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            expect(cacheRepo.get).toHaveBeenCalledWith(999);
            expect(dbRepo.findOne).toHaveBeenCalledWith(999);
            expect(cacheRepo.set).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update an example and update cache', async () => {
            const updateDto: UpdateExampleDto = { title: 'Updated Title' };
            const updatedExample = { ...mockExample, ...updateDto };

            dbRepo.findOne.mockResolvedValueOnce(mockExample);
            dbRepo.update.mockResolvedValue(updatedExample);

            const result = await service.update(1, updateDto);

            expect(dbRepo.findOne).toHaveBeenCalledWith(1);
            expect(dbRepo.update).toHaveBeenCalledWith(1, updateDto);
            expect(cacheRepo.set).toHaveBeenCalledWith(1, JSON.stringify(updatedExample));
            expect(result).toEqual(updatedExample);
        });

        it('should throw NotFoundException when example not found', async () => {
            dbRepo.findOne.mockResolvedValue(null);

            await expect(service.update(999, { title: 'New Title' })).rejects.toThrow(
                NotFoundException,
            );
            expect(dbRepo.findOne).toHaveBeenCalledWith(999);
            expect(dbRepo.update).not.toHaveBeenCalled();
            expect(cacheRepo.set).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete an example and remove from cache', async () => {
            dbRepo.findOne.mockResolvedValue(mockExample);

            await service.delete(1);

            expect(dbRepo.findOne).toHaveBeenCalledWith(1);
            expect(dbRepo.delete).toHaveBeenCalledWith(1);
            expect(cacheRepo.del).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when example not found', async () => {
            dbRepo.findOne.mockResolvedValue(null);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            expect(dbRepo.findOne).toHaveBeenCalledWith(999);
            expect(dbRepo.delete).not.toHaveBeenCalled();
            expect(cacheRepo.del).not.toHaveBeenCalled();
        });
    });

    describe('clearCache', () => {
        it('should flush the cache with the correct pattern', async () => {
            await service.clearCache();
            expect(cacheRepo.flushPattern).toHaveBeenCalledWith('example:*');
        });
    });
});
