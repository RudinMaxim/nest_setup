export type DocumentFilters = {
    departmentId?: string;
    pinned?: string;
};

export type DocumentWhere = {
    departmentId?: number;
    pinned?: boolean;
};
