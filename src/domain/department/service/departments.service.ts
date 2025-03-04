import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DepartmentCreateDto } from '../dto';
import { DepartmentEntity } from '../common';
import { DepartmentsRepository } from '../repository';
import { DepartmentBaseDto, DepartmentUpdateDto } from '../dto';
import { FilterDto, ListResponseDto, PaginationDto, SortDto } from '../../../shared/dto';

abstract class IDepartmentsService {
    abstract create(dto: DepartmentCreateDto): Promise<DepartmentBaseDto>;
    abstract find(id: number): Promise<DepartmentBaseDto>;
    abstract findMany(
        filters?: FilterDto,
        pagination?: PaginationDto,
        sort?: SortDto,
    ): Promise<ListResponseDto<DepartmentBaseDto>>;
    abstract update(id: number, dto: DepartmentUpdateDto): Promise<DepartmentBaseDto>;
    abstract delete(id: number): Promise<DepartmentBaseDto>;
}

@Injectable()
export class DepartmentsService implements IDepartmentsService {
    constructor(private readonly departmentsRepository: DepartmentsRepository) {}

    async create(dto: DepartmentCreateDto): Promise<DepartmentBaseDto> {
        const newDepartment = new DepartmentEntity(dto);
        const createdDepartment = await this.departmentsRepository.create(newDepartment);
        if (!createdDepartment) {
            throw new HttpException(
                'Failed to create department!',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        return createdDepartment;
    }

    async find(id: number): Promise<DepartmentBaseDto> {
        const foundDepartment = await this.departmentsRepository.find(id);
        if (!foundDepartment) {
            throw new HttpException('Department not found!', HttpStatus.NOT_FOUND);
        }
        return foundDepartment;
    }

    async findMany(
        filters?: FilterDto,
        pagination?: PaginationDto,
        sort?: SortDto,
    ): Promise<ListResponseDto<DepartmentBaseDto>> {
        const departments = await this.departmentsRepository.findMany(filters, pagination, sort);

        if (!departments || departments?.data.length === 0) {
            throw new HttpException('Departments not found!', HttpStatus.NOT_FOUND);
        }

        return departments;
    }

    async update(id: number, dto: DepartmentUpdateDto): Promise<DepartmentBaseDto> {
        const targetDepartment = await this.departmentsRepository.find(id);
        if (!targetDepartment) {
            throw new HttpException('Department to update not found!', HttpStatus.NOT_FOUND);
        }
        const updatedDepartment = await this.departmentsRepository.update(id, dto);
        if (!updatedDepartment) {
            throw new HttpException(
                'Failed to update department!',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        return updatedDepartment;
    }

    async delete(id: number): Promise<DepartmentBaseDto> {
        const deletedDepartment = await this.departmentsRepository.delete(id);
        if (!deletedDepartment) {
            throw new HttpException('Department not found!', HttpStatus.NOT_FOUND);
        }
        return deletedDepartment;
    }
}
