import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {
    @IsNotEmpty({ message: `Email can't be emptied` })
    email: string

    @IsNotEmpty({ message: `UserId can't be emptied` })
    userId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: `Url can't be emptied` })
    url: string;

    @IsNotEmpty({ message: `Status can't be emptied` })
    status: string;

    @IsNotEmpty({ message: `CompanyId can't be emptied` })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: `JobId can't be emptied` })
    jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCVDto {
    @IsNotEmpty({ message: `Url can't be emptied` })
    url: string;

    @IsNotEmpty({ message: `CompanyId can't be emptied` })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: `JobId can't be emptied` })
    jobId: mongoose.Schema.Types.ObjectId;
}
