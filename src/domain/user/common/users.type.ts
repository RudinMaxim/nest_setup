import { Role, User } from '@prisma/client';
import { UserBaseDto } from '../dto';

export type IUser = Omit<User, 'resetPasswordToken' | 'resetPasswordExpires'>;

export type AuthInfo = Omit<User, 'password' | 'resetPasswordToken' | 'resetPasswordExpires'>;
export type WithAuthInfo<Type> = Type & { authInfo: AuthInfo };

export type UserOmitOptions = Record<string, boolean>;

export type EditableFields = Record<Role, Array<keyof UserBaseDto>>;
