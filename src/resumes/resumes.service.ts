import { Injectable } from '@nestjs/common';
import { CreateUserCVDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/interface/users.interface';
import aqp from 'api-query-params';
import mongoose, { Types } from 'mongoose';

@Injectable()
export class ResumesService {

  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>
  ) { }

  async create(createUserCVDto: CreateUserCVDto, user: IUser) {
    const resume = await this.resumeModel.create({
      ...createUserCVDto,
      email: user.email,
      userId: user._id,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ],
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return {
      _id: resume._id,
      createdAt: resume.createdAt
    }
  }

  async findAll(current: number, pageSize: number, queryString: string) {

    const defaultLimit = pageSize ? pageSize : 10;
    const offset = (current - 1) * defaultLimit;

    const { filter, sort, population, projection } = aqp(queryString);

    delete filter.current;
    delete filter.pageSize;

    const result = await this.resumeModel.find(filter)
      .sort(sort as any)
      .limit(defaultLimit)
      .skip(offset)
      .populate(population)
      .select(projection)
      .exec();

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

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
    return await this.resumeModel.findOne({ _id: id });
  }

  async update(id: string, status: string, user: IUser) {
    return await this.resumeModel.updateOne(
      { _id: id },
      {
        status,
        $push: {
          history: {
            status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        },
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
  }

  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return this.resumeModel.softDelete({ _id: id });
  }

  async getCVByUserService(user: IUser) {
    return await this.resumeModel.find({ userId: user._id })
      .sort('-createdAt')
      .populate([
        {
          path: 'companyId',
          select: 'name'
        },
        {
          path: 'jobId',
          select: 'name'
        }
      ]);
  }
}
