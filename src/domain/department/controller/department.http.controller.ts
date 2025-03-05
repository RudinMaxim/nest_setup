import {
    Controller,
    Post,
    UseGuards,
    Body,
    Get,
    Query,
    Param,
    Put,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles, RolesGuard } from '../../common';
import { DepartmentCreateDto, DepartmentUpdateDto } from '../dto';
import { DepartmentsService } from '../service';
import { QueryParamsDto } from '../../../shared/dto';

@ApiTags('Отделы')
@Controller('departments')
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) { }

    @Post('/')
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Создает и возвращает созданный отдел.' })
    @ApiBody({ type: DepartmentCreateDto })
    @ApiResponse({ status: 201, description: 'Отдел создан.' })
    @ApiResponse({ status: 422, description: 'Ошибка валидации.' })
    async create(@Body() departmentCreateDto: DepartmentCreateDto) {
        return this.departmentsService.create(departmentCreateDto);
    }

    @Get('/')
    @ApiOperation({ summary: 'Находит и возвращает все отделы.' })
    @ApiQuery({
        name: 'name',
        required: false,
        type: String,
        description: 'Поиск отделов по названию отдела.',
    })
    @ApiQuery({
        name: 'userName',
        required: false,
        type: String,
        description: 'Поиск отделов по полному имени сотрудника.',
    })
    @ApiQuery({
        name: 'nameSort',
        required: false,
        enum: ['desc', 'asc'],
        description: 'Сортировка отделов по названию отдела.',
    })
    @ApiQuery({
        name: 'membersSort',
        required: false,
        enum: ['desc', 'asc'],
        description: 'Сортировка отделов по количеству сотрудников.',
    })
    @ApiResponse({ status: 200, description: 'Список отделов.' })
    @ApiResponse({ status: 404, description: 'Отделы не найдены.' })
    async findAllAndFilter(@Query() query: QueryParamsDto) {
        return this.departmentsService.findMany(query.pagination, query.sort);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Находит и возвращает отдел по ID.' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'ID отдела.' })
    @ApiResponse({ status: 200, description: 'Отдел найден.' })
    @ApiResponse({ status: 404, description: 'Отдел не найден.' })
    async find(@Param('id', ParseIntPipe) id: number) {
        return this.departmentsService.find(id);
    }

    @Put('/:id')
    @Roles(Role.ADMIN, Role.ADMIN_DEPARTMENT)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Обновляет и возвращает обновленный отдел по ID.' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'ID отдела.' })
    @ApiBody({ type: DepartmentUpdateDto })
    @ApiResponse({ status: 200, description: 'Отдел обновлен.' })
    @ApiResponse({ status: 404, description: 'Отдел не найден.' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() departmentUpdateDto: DepartmentUpdateDto,
    ) {
        return this.departmentsService.update(id, departmentUpdateDto);
    }

    @Delete('/:id')
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Удаляет и возвращает данные удаленного отдела по ID.' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'ID отдела.' })
    @ApiResponse({ status: 200, description: 'Отдел удален.' })
    @ApiResponse({ status: 404, description: 'Отдел не найден.' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.departmentsService.delete(id);
    }
}
