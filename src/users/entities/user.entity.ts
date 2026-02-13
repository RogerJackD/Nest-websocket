import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../../common/enums/role.enum";

@Entity({name: 'users'})
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: "varchar", unique: true})
    email: string;

    @Column({ type: "varchar"})
    password: string;

    @Column({type: "varchar", name: "full_name"})
    fullName: string;

    @Column({type: "enum", enum: Role, default: Role.USER})
    role: Role;

    @Column({type: 'bool', name: "is_active", default: true})
    isActive: boolean;

    @CreateDateColumn({name: "create_at"})
    createAt: Date;
}
