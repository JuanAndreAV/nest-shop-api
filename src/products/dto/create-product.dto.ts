import { IsNumber, IsPositive, IsString, 
    MinLength, IsOptional, IsInt, IsArray, IsIn } 
    from "class-validator";

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;
    
    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;
    
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock: number;

    @IsString({each: true})
    @IsArray()
    sizes: string[];

    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @IsArray()
    @IsString({each: true})
    @IsOptional()
    tags: string[]

    @IsArray()
    @IsString({each: true})
    @IsOptional()
    images?: string[]

}
