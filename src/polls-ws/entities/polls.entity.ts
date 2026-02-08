import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "polls"})
export class Poll {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({type: "varchar"})
    question: string;

    @Column({type: "jsonb"})
    options: string[];

    @Column({type: "jsonb"})
    votes: number[];

    @CreateDateColumn()
    createdAt: Date;
}
