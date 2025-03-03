import { UserBaseDto } from '../../user/dto';

export interface IAuthData extends Pick<UserBaseDto, 'id'> {
    accessToken: string;
}
