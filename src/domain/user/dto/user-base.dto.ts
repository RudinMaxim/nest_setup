import { IsString, IsEmail, IsOptional, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Grade, Role, User } from '@prisma/client';
import { BaseDto } from '../../../shared/dto';

export class UserBaseDto extends BaseDto implements User {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsString()
    telegram: string;

    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    surname: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    patronymic: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    avatar: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dateBirth: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    education: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    courses: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dateStart: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    post: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(Grade)
    grade: Grade;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dateAttestation: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    timeZone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(Role)
    role: Role;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    resetPasswordToken: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    resetPasswordExpires: Date | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    departmentId: number | null;
}
