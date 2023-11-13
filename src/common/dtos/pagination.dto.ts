import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'How many products do you need',
    })
    @IsOptional()
    @IsPositive()
    // existe alguna forma para tranformar
    @Type( () => Number )  // enableImplicitConversions: true
    limit?: number;

    @ApiProperty({
        default: 0,
        description: 'How many products do you want to skip',
    })
    @IsOptional()
    // @IsPositive()
    @Min(0)
    @Type( () => Number )  // enableImplicitConversions: true
    offset?: number;

}