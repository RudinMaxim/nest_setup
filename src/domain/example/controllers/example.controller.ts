import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExampleService } from '../services';
import { CreateExampleDto, UpdateExampleDto } from '../dto';
import { Example } from '../entities/example.entity';
import { BasePaginationDto } from 'src/shared/dto';

@ApiTags('Example')
@Controller('examples')
export class ExampleController {
    constructor(private readonly service: ExampleService) {}

    @Post()
    @ApiOperation({ summary: 'Create new example' })
    @ApiResponse({ status: 201, type: Example })
    create(@Body() dto: CreateExampleDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiResponse({ status: 200, type: [Example] })
    findAll(@Query() pagination: BasePaginationDto) {
        return this.service.findAll(pagination);
    }

    @Get(':id')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: Example })
    @ApiResponse({ status: 404, description: 'Not Found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: Example })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExampleDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 204 })
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.service.delete(id);
    }
}
