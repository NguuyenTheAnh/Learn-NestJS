import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/interface/users.interface';
import aqp from 'api-query-params';
import { USER_ROLE } from 'src/databases/sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';

@Injectable()
export class UsersService {
  constructor(

    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>
  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    // check email exist
    const isExist = await this.userModel.findOne({ email: createUserDto.email });
    if (isExist) throw new BadRequestException('Email exists');
    //fetch user role
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const hashPassword = this.getHashPassword(createUserDto.password);
    let newUser = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      role: userRole?._id,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return {
      _id: newUser._id,
      createdAt: newUser.createdAt
    };
  }

  async findAll(page: number, limit: number, queryString: string) {
    const offset = (page - 1) * limit;
    const { filter, sort, population } = aqp(queryString);

    delete filter.current;
    delete filter.pageSize;

    let defaultLimit = limit ? limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();


    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  async findOneById(id: string) {
    let user = await this.userModel.findOne({ _id: id })
      .select("-password")
      .populate({ path: "role", select: ['_id', 'name'] });
    return user;
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email }).populate({ path: "role", select: 'name' });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    const foundUser = await this.userModel.findById(id);
    if (foundUser.email === "admin@gmail.com") {
      throw new BadRequestException("admin@gmail.com account can not be deleted");
    }
    await this.userModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return this.userModel.softDelete({ _id: id });
  }

  async updateUserToken(refreshToken: string, _id: string) {
    await this.userModel.updateOne({ _id }, { refreshToken });
  }

  async findUserByToken(refreshToken: string) {
    return await this.userModel.findOne({ refreshToken }).populate({ path: "role", select: 'name' });
  }
}
