import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator"
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: `Name can't be emptied` })
    name: string

    @IsNotEmpty({ message: `Description can't be emptied` })
    description: string;

    @IsNotEmpty({ message: `IsActive can't be emptied` })
    @IsBoolean({ message: `IsActive has boolean value` })
    isActive: string

    @IsNotEmpty({ message: `Module can't be emptied` })
    @IsMongoId({ each: true, message: `Each permission is mongoose objectId` })
    @IsArray({ message: `Permissions is array` })
    permissions: mongoose.Schema.Types.ObjectId[];
}
