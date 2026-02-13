import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

  async create(registerDto: RegisterDto) {

    try {
      const newUser = this.userRepository.create({...registerDto});
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async findOneByEmail(email : string ){
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private handleDbErrors(error: any) {
    if(error.code === '23505') throw new BadRequestException(error.detail)

    throw new BadRequestException('ERROR DB EXCEPTIONS CHECK LOGS')
  }


}
