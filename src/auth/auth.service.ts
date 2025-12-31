

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import *as bcrypt from 'bcrypt';
import { User } from './entities/auth.entity';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto,CreateUserDto } from './dto';



export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    
    try{
      const {password, ...userData} = createUserDto
      const user = this.userRepository.create({...userData, 
        password: bcrypt.hashSync(password,10)
      })
      await this.userRepository.save(user)
        
     delete (user as Partial<User>).password;// The password property is not optional in the User entity, but we want to exclude it from the returned object.

      return user
    }catch(error){
       this.handleDbExceptions(error)
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const {email, password} = loginUserDto
    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true} 
    })
    if(!user)
      throw new UnauthorizedException('Credentials are not valid (email)');
    if(!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');
    return user
  }

  private handleDbExceptions(error: any): never{
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    console.log(error)
    throw new InternalServerErrorException('Please check server logs');
  }

  
}
