import { IsString } from 'class-validator';
import { PasswordDto } from 'src/domain/common/dto/password.dto';

export class PasswordResetDto extends PasswordDto {
    @IsString({ message: 'Token is wrong!' })
    token: string;
}
