import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateUserCVDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/interface/users.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @Post()
  @ResponseMessage('Create a new resume')
  create(
    @Body() createUserCVDto: CreateUserCVDto,
    @User() user: IUser
  ) {
    return this.resumesService.create(createUserCVDto, user);
  }

  @Get()
  @ResponseMessage('Fetch all resumes with paginate')
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query() queryString: string,


  ) {
    return this.resumesService.findAll(+current, +pageSize, queryString);
  }

  @Get(':id')
  @ResponseMessage('Fetch a resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update status resume')
  update(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser
  ) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a resume by id')
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.resumesService.remove(id, user);
  }

  @Post('by-user')
  @ResponseMessage('Get Resumes by User')
  getCVByUser(@User() user: IUser) {
    return this.resumesService.getCVByUserService(user);
  }
}
