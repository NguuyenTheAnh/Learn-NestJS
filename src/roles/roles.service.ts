import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import aqp from 'api-query-params';
import { IUser } from 'src/interface/users.interface';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {

  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>
  ) { }

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const isExistedName = await this.roleModel.findOne({ name: createRoleDto.name, isDeleted: false });
    console.log(createRoleDto.name, isExistedName);

    if (isExistedName)
      throw new BadRequestException('Role name existed');
    return await this.roleModel.create({
      ...createRoleDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async findAll(current: number, pageSize: number, queryString: string) {

    const defaultLimit = pageSize ? pageSize : 10;
    const offset = (current - 1) * pageSize;
    const { filter, sort, projection, population } = aqp(queryString);
    delete filter.current;
    delete filter.pageSize;
    let totalItems = (await this.roleModel.find(filter)).length;
    let totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection)
      .populate(population)
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
    return await this.roleModel.findOne({ _id: id }).populate({
      path: 'permissions',
      select: ['_id', 'name', 'apiPath', 'method', 'module']
    }
    );
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    return await this.roleModel.updateOne({ _id: id },
      {
        ...updateRoleDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    const foundRole = await this.roleModel.findById(id);
    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException("Role ADMIN can not be deleted");
    }
    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.roleModel.softDelete({ _id: id });
  }
}
