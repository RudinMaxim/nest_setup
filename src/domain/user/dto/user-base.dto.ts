import { IsString, IsEmail, IsOptional, IsUUID, IsBoolean, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, Grade, Role, User } from '@prisma/client';
import { BaseDto } from 'src/shared/dto';

export class UserBaseDto extends BaseDto implements User {
    @ApiProperty()
    @IsEmail()
    readonly email: string;

    @ApiProperty()
    @IsString()
    readonly phone: string;

    @ApiProperty()
    @IsString()
    readonly telegram: string;

    @ApiProperty()
    @IsString()
    readonly password: string;

    @ApiProperty()
    @IsString()
    readonly name: string;

    @ApiProperty()
    @IsString()
    readonly surname: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly patronymic: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly avatar: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly dateBirth: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly education: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly courses: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly dateStart: Date;

    @ApiProperty()
    @IsUUID()
    readonly departmentId: string;

    @ApiProperty()
    @IsUUID()
    readonly statusId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly post: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(Grade)
    readonly grade: Grade;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly gender: Gender;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly dateAttestation: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly timeZone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(Role)
    readonly role: Role;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly statusOnboarding: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    readonly isActive: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly resetPasswordToken: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly resetPasswordExpires: Date | null;
}
