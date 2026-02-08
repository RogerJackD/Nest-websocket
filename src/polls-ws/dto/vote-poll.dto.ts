import { IsNumber, Min } from "class-validator";

export class VotePollDto {

    @IsNumber()
    pollId: number;

    @IsNumber()
    @Min(0)
    optionIndex: number;
}