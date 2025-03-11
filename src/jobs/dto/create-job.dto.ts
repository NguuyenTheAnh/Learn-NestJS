import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from "class-validator"
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}

export class CreateJobDto {
    @IsNotEmpty({ message: `Name can't be emptied` })
    name: string

    @IsNotEmpty({ message: `Address can't be emptied` })
    skills: string[]

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: `Salary can't be emptied` })
    salary: number

    @IsNotEmpty({ message: `Quantity can't be emptied` })
    quantity: number

    @IsNotEmpty({ message: `Level can't be emptied` })
    level: string

    @IsNotEmpty({ message: `Description can't be emptied` })
    description: string

    @IsNotEmpty({ message: `Location can't be emptied` })
    location: string

    @IsNotEmpty({ message: `startDate can't be emptied` })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: 'startDate should have Date type' })
    startDate: Date;

    @IsNotEmpty({ message: `endDate can't be emptied` })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: 'endDate should have Date type' })
    endDate: Date;

    @IsNotEmpty({ message: `isActive can't be emptied` })
    @IsBoolean({ message: 'isActive should have boolean type' })
    isActive: boolean
}
