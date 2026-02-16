import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { AzureStorageService } from 'src/azure-storage/azure-storage.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly azureStorageService: AzureStorageService,
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

  async updateProfileImage(id: string, file: Express.Multer.File){
    //searchUser
    const user =  await this.userRepository.findOneBy({id});
    if(!user) throw new BadRequestException('User not found');

    if( user.profileImage ){
      await this.azureStorageService.deleteFile(user.profileImage)
    }

    //upload new image
    const imageUrl = await this.azureStorageService.uploadFile(file);

    user.profileImage = imageUrl;

    return this.userRepository.save(user);
  }


  private handleDbErrors(error: any) {
    if(error.code === '23505') throw new BadRequestException(error.detail)

    throw new BadRequestException('ERROR DB EXCEPTIONS CHECK LOGS')
  }


}
