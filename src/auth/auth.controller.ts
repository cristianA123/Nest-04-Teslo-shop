import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';

import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    // @Res() request: Express.Request
    @GetUser() user: User
  ) {

    // console.log({user: request.user});


    return {
      success: true,
      msg: 'Hola mundo private',
      user
    }
  }
}
