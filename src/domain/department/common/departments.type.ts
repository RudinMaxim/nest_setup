import { Department } from '@prisma/client';

export type DepartmentList = Department & {
    members: number;
};

export type DepartmentsFilters = {
    name?: string;
    userName?: string;
    nameSort?: 'asc' | 'desc';
    membersSort?: 'asc' | 'desc';
};
