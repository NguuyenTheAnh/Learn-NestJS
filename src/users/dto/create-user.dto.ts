import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

//data transfer object // class = { }

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateUserDto {

    @IsNotEmpty({ message: 'Name can not be emptied', })
    name: string;

    @IsEmail({}, { message: 'Email is invalid', })
    @IsNotEmpty({ message: 'Email can not be emptied', })
    email: string;

    @IsNotEmpty({ message: 'Password can not be emptied', })
    password: string;

    @IsNotEmpty({ message: 'Age can not be emptied', })
    age: number;

    @IsNotEmpty({ message: 'Gender can not be emptied', })
    gender: string;

    @IsNotEmpty({ message: 'Address can not be emptied', })
    address: string;

    @IsNotEmpty({ message: 'Role can not be emptied', })
    role: mongoose.Schema.Types.ObjectId;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}

export class RegisterUserDto {

    @IsNotEmpty({ message: 'Name can not be emptied', })
    name: string;

    @IsEmail({}, { message: 'Email is invalid', })
    @IsNotEmpty({ message: 'Email can not be emptied', })
    email: string;

    @IsNotEmpty({ message: 'Password can not be emptied', })
    password: string;

    @IsNotEmpty({ message: 'Age can not be emptied', })
    age: number;

    @IsNotEmpty({ message: 'Gender can not be emptied', })
    gender: string;

    @IsNotEmpty({ message: 'Address can not be emptied', })
    address: string;
}