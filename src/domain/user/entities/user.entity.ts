import { hash } from 'bcryptjs';
import { User, Grade, Gender, Role } from '@prisma/client';

export class UserEntity implements Omit<User, 'password'> {
    readonly uuid: string;
    readonly email: string;
    private password: string;
    readonly phone: string;
    readonly telegram: string;
    readonly name: string;
    readonly surname: string;
    readonly avatar: string | null;
    readonly patronymic: string | null;
    readonly dateBirth: Date;
    readonly education: string | null;
    readonly courses: string | null;
    readonly dateStart: Date;
    readonly departmentId: string;
    readonly statusId: string;
    readonly post: string;
    readonly grade: Grade;
    readonly gender: Gender;
    readonly dateAttestation: Date;
    readonly timeZone: string | null;
    readonly role: Role;
    readonly statusOnboarding: string;
    readonly isActive: boolean;
    readonly resetPasswordToken: string | null;
    readonly resetPasswordExpires: Date | null;

    constructor(user: User) {
        this.uuid = user.uuid;
        this.email = user.email;
        this.phone = user.phone;
        this.telegram = user.telegram;
        this.name = user.name;
        this.avatar = user.avatar;
        this.surname = user.surname;
        this.dateBirth = user.dateBirth;
        this.post = user.post;
        this.grade = user.grade;
        this.dateAttestation = user.dateAttestation;
        this.patronymic = user.patronymic;
        this.education = user.education;
        this.courses = user.courses;
        this.dateStart = user.dateStart;
        this.departmentId = user.departmentId;
        this.timeZone = user.timeZone;
        this.role = user.role;
        this.statusOnboarding = user.statusOnboarding;
        this.isActive = user.isActive;
        this.resetPasswordToken = user.resetPasswordToken;
        this.resetPasswordExpires = user.resetPasswordExpires;
    }

    getPassword(): string {
        return this.password;
    }

    async setPassword(password: string, salt: string): Promise<void> {
        this.password = await hash(password, salt);
    }
}
