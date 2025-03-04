import { IsString } from 'class-validator';
import { PasswordDto } from '../../common';

export class PasswordResetDto extends PasswordDto {
    @IsString({ message: 'Token is wrong!' })
    token: string;
}
