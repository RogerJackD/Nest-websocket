import { IsArray, IsString } from "class-validator";

export class CreatePollDto {
    @IsString()
    question: string;

    @IsArray()
    @IsString({ each: true })
    options: string[];

}
