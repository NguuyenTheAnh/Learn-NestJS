import { IsNotEmpty } from "class-validator";

export class CreateCompanyDto {
    @IsNotEmpty({ message: `Name can't be emptied` })
    name: string

    @IsNotEmpty({ message: `Address can't be emptied` })
    address: string

    @IsNotEmpty({ message: `Description can't be emptied` })
    description: string

    @IsNotEmpty({ message: `Logo can't be emptied` })
    logo: string

}
