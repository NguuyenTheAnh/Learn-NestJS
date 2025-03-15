import { IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({ message: `Name can't be emptied` })
    name: string

    @IsNotEmpty({ message: `ApiPath can't be emptied` })
    apiPath: string

    @IsNotEmpty({ message: `Method can't be emptied` })
    method: string

    @IsNotEmpty({ message: `Module can't be emptied` })
    module: string
}
