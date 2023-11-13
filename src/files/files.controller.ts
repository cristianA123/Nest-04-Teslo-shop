import { Controller, Get, Post, Res, Body, Patch, Param, 
  Delete, UploadedFile, UseInterceptors, 
  BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {

    const path = this.filesService.getStaticProductImage( imageName );

    res.sendFile( path)
  }




  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 1000 }
    storage:  diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }) )
  create( @UploadedFile() file: Express.Multer.File ) {


    if ( !file ) {
      throw new BadRequestException('Make sure that the file is a image')
    }

    // const secureUrl = `${file.filename}`
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${ file.filename }`;

    return {
      secureUrl
    };
  }


}
