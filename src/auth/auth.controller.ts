import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Headers, SetMetadata } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';

import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';

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
    // @Res() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {

    // console.log({user: request.user});
    // console.log(request);

    return {
      success: true,
      msg: 'Hola mundo private',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }

  @Get('private2')
  @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards( AuthGuard(), UserRoleGuard )
  PrivateRoute2(
    @GetUser() user: User,
  ) {

    return {
      success: true,
      msg: 'Hola mundo private',
      user,
    }
  }


}
