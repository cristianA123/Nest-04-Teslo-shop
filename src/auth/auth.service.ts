import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

import * as bcrypt from "bcrypt";
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository( User )
    private readonly useRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } =  createUserDto;

      const user = this.useRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.useRepository.save(user);

      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({id: user.id})
      };


    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async login( loginUserDto : LoginUserDto ) {

      const { password, email } = loginUserDto;

      const user = await this.useRepository.findOne({ 
        where: { email },
        select: { email: true, password: true, id: true }
       })

      if ( !user )
       throw new UnauthorizedException('Credentials are not valid (email)');

      if ( !bcrypt.compareSync(password, user.password) )
        throw new UnauthorizedException('Credentials are not valid (password)');

      return {
        ...user,
        token: this.getJwtToken({id: user.id})
      };
  }

  async checkAuthStatus( user: User ) {

    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    };

  }

  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign(payload)
    return token;
  }


  private handleDBErrors (error : any) : never {

    if ( error.code ===  '23505' )
      throw new BadRequestException( error.detail )

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');

  }

}
