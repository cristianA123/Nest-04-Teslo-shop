import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Headers, SetMetadata } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';

import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';
import { GetUser, Auth, RoleProtected, RawHeaders } from './decorators';

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

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
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

  // @SetMetadata('roles', ['admin', 'super-user']) || @RoleProtected(ValidRoles.superUser, ValidRoles.admin )

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin )
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

  @Get('private3')
  @Auth( ValidRoles.admin )
  PrivateRoute3(
    @GetUser() user: User,
  ) {

    return {
      success: true,
      msg: 'Hola mundo private',
      user,
    }
  }


}
