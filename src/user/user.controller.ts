import { Controller, Delete, Get } from '@nestjs/common';

@Controller('theanh')
export class UserController {
  @Get()
  findAll(): string {
    return 'This action returns all users';
  }

  @Delete("/by-id")
  findById(): string {
    return 'This action will delete a user by id';
  }

}
