import { PartialType } from '@nestjs/swagger';
import { UserCreateDto } from '.';

export class UserUpdateDto extends PartialType(UserCreateDto) {}
