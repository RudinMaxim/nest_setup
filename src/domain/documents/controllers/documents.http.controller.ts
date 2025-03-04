import {
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Body,
    Get,
    Param,
    ParseIntPipe,
    Query,
    Put,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common';
import { DocumentFilters } from '../common';
import { DocumentCreateDto, DocumentUpdateDto } from '../dto';
import { DocumentsService } from '../service';

@ApiTags('Документы')
@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Post()
    @Roles(Role.ADMIN, Role.ADMIN_DEPARTMENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new document' })
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: DocumentCreateDto) {
        return this.documentsService.create(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get document by ID' })
    async find(@Param('id', ParseIntPipe) id: number) {
        return this.documentsService.find(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all documents' })
    async findAll(@Query() filters?: DocumentFilters) {
        return this.documentsService.findAll(filters);
    }

    @Put(':id')
    @Roles(Role.ADMIN, Role.ADMIN_DEPARTMENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update document by ID' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: DocumentUpdateDto) {
        return this.documentsService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.ADMIN_DEPARTMENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete document by ID' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.documentsService.delete(id);
    }
}
