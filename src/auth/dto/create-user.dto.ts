import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto{
    @IsString()
   @IsEmail()
    email: string;

    @IsString()
    @MaxLength(50)
    @MinLength(8)
    @Matches( /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number', 
    })
    password?: string;

    @IsString()
    @MaxLength(100)
    @MinLength(3)
    fullName: string;


    //roles: string[];
}