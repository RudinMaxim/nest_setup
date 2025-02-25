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
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ExampleService } from '../services';
import { CreateExampleDto, UpdateExampleDto, ExampleQueryParamsDto } from '../dto';
import { Example } from '../entities/example.entity';
import { ApiResponseDto } from 'src/shared/dto/api-response.dto';
import { ListResponseDto } from 'src/shared/dto/list-response.dto';

@ApiTags('Example')
@Controller('examples')
export class ExampleController {
    constructor(private readonly service: ExampleService) {}

    @Post()
    @ApiOperation({ summary: 'Create new example' })
    @ApiResponse({
        status: 201,
        description: 'The example has been successfully created',
        type: Example,
    })
    async create(@Body() dto: CreateExampleDto): Promise<ApiResponseDto<Example>> {
        const result = await this.service.create(dto);
        return {
            success: true,
            message: 'Example created successfully',
            data: result,
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all examples with pagination, filtering and sorting' })
    @ApiResponse({
        status: 200,
        description: 'Return all examples that match the query parameters',
        type: ListResponseDto,
    })
    async findAll(
        @Query() queryParams: ExampleQueryParamsDto,
    ): Promise<ApiResponseDto<ListResponseDto<Example>>> {
        const result = await this.service.findAll(queryParams);
        return {
            success: true,
            message: 'Examples retrieved successfully',
            data: result,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get one example by id' })
    @ApiParam({ name: 'id', type: Number, description: 'Example ID' })
    @ApiResponse({
        status: 200,
        description: 'Return the example with the specified id',
        type: Example,
    })
    @ApiResponse({ status: 404, description: 'Example not found' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDto<Example>> {
        const result = await this.service.findOne(id);
        return {
            success: true,
            message: 'Example retrieved successfully',
            data: result,
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an example by id' })
    @ApiParam({ name: 'id', type: Number, description: 'Example ID' })
    @ApiResponse({
        status: 200,
        description: 'The example has been successfully updated',
        type: Example,
    })
    @ApiResponse({ status: 404, description: 'Example not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateExampleDto,
    ): Promise<ApiResponseDto<Example>> {
        const result = await this.service.update(id, dto);
        return {
            success: true,
            message: 'Example updated successfully',
            data: result,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an example by id' })
    @ApiParam({ name: 'id', type: Number, description: 'Example ID' })
    @ApiResponse({ status: 204, description: 'The example has been successfully deleted' })
    @ApiResponse({ status: 404, description: 'Example not found' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.service.delete(id);
    }

    @Delete('cache/clear')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Clear all example cache' })
    @ApiResponse({ status: 204, description: 'Cache cleared successfully' })
    async clearCache(): Promise<void> {
        await this.service.clearCache();
    }
}
