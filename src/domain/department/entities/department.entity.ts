import { Department } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class DepartmentEntity implements Omit<Department, 'id'> {
    @ApiProperty()
    readonly name: string;

    @ApiProperty({ required: false })
    readonly description: string | null;

    @ApiProperty({ required: false })
    readonly headId: number | null;

    @ApiProperty({ required: false })
    readonly competenceId: number | null;

    constructor(department: Omit<Department, 'id'>) {
        Object.assign(this, department);
    }

    connectMembers() {
        return this.headId ? { connect: { id: this.headId } } : undefined;
    }
}
