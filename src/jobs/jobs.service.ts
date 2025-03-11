import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/interface/users.interface';
import { Job, JobDocument } from './schemas/job.schema';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {

  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>
  ) { }

  async create(createJobDto: CreateJobDto, user: IUser) {
    let job = await this.jobModel.create({
      ...createJobDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return {
      _id: job._id,
      createdAt: job.createdAt
    }
  }

  async findAll(current: number, pageSize: number, queryString: string) {

    const offset = (current - 1) * pageSize;
    const { filter, sort } = aqp(queryString);

    delete filter.current;
    delete filter.pageSize;

    const defaultLimit = pageSize ? pageSize : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
      .limit(defaultLimit)
      .skip(offset)
      .sort(sort as any)
      .exec();

    return {
      meta: {
        current: current,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems
      },
      result
    };
  }

  async findOne(id: string) {
    return await this.jobModel.findOne({ _id: id });
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    return await this.jobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return this.jobModel.softDelete({ _id: id });
  }
}
