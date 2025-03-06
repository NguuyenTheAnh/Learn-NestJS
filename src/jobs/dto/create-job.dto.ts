import { Type } from "class-transformer";
import { IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from "class-validator"
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
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

    @IsNotEmpty({ message: `Start date can't be emptied` })
    startDate: Date

    @IsNotEmpty({ message: `End date can't be emptied` })
    endDate: Date

}
