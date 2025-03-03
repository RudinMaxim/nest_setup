import { hash } from 'bcryptjs';
import { User, Grade, Role } from '@prisma/client';

export class UserEntity implements Omit<User, 'password'> {
    id: number;
    email: string;
    phone: string;
    telegram: string;
    name: string;
    avatar: string | null;
    surname: string;
    private password: string;
    patronymic: string | null;
    dateBirth: Date;
    education: string | null;
    courses: string | null;
    dateStart: Date;
    departmentId: number | null;
    post: string;
    grade: Grade;
    dateAttestation: Date;
    timeZone: string;
    role: Role;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.phone = user.phone;
        this.telegram = user.telegram;
        this.name = user.name;
        this.avatar = user.avatar;
        this.surname = user.surname;
        this.password = user.password;
        this.patronymic = user.patronymic;
        this.dateBirth = user.dateBirth;
        this.education = user.education;
        this.courses = user.courses;
        this.dateStart = user.dateStart;
        this.departmentId = user.departmentId;
        this.post = user.post;
        this.grade = user.grade;
        this.dateAttestation = user.dateAttestation;
        this.timeZone = user.timeZone;
        this.role = user.role;
        this.resetPasswordToken = user.resetPasswordToken;
        this.resetPasswordExpires = user.resetPasswordExpires;
    }

    /**
     * Возвращает хешированный пароль пользователя
     * @returns {string} Хешированный пароль
     */
    getPassword(): string {
        return this.password;
    }

    /**
     * Устанавливает новый пароль пользователя
     * @param {string} password - Новый пароль в открытом виде
     * @param {string} salt - Соль для хеширования
     * @returns {Promise<void>}
     */
    async setPassword(password: string, salt: string): Promise<void> {
        this.password = await hash(password, salt);
    }

    /**
     * Проверяет, является ли пользователь администратором
     * @returns {boolean}
     */
    isAdmin(): boolean {
        return this.role === 'ADMIN';
    }

    /**
     * Проверяет, является ли пользователь администратором департамента
     * @returns {boolean}
     */
    isDepartmentAdmin(): boolean {
        return this.role === 'ADMIN_DEPARTMENT';
    }

    /**
     * Проверяет, имеет ли пользователь какие-либо административные права
     * @returns {boolean}
     */
    hasAdminRights(): boolean {
        return this.isAdmin() || this.isDepartmentAdmin();
    }

    /**
     * Проверяет, имеет ли пользователь определенный уровень грейда или выше
     * @param {Grade} grade - Грейд для сравнения
     * @returns {boolean}
     */
    hasGradeOrHigher(grade: Grade): boolean {
        const gradeOrder: Record<Grade, number> = {
            INTERN: 0,
            JUNIOR: 1,
            MIDDLE: 2,
            MIDDLE_PLUS: 3,
            SENIOR: 4,
        };

        return gradeOrder[this.grade] >= gradeOrder[grade];
    }
}
