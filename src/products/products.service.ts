import { NotFoundException, BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';

import {  validate as isUUID } from 'uuid'
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    
    try {

      const { images= [], ...productDetails } = createProductDto;
      
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({url: image}) )
      });
      await this.productRepository.save(product);

      return {...product, images}

    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {

      const { limit = 10, offset = 0 } = paginationDto;

      const product = this.productRepository.find({
        take: limit,
        skip: offset,
        // todo: Relaciones
        relations: {
          images: true,
        }
      });
      return (await product).map( product => ({
        ...product,
        images: product.images.map( img => img.url )
      }) )
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findOne(term: string) {

    try {

      let product: Product;

      if ( isUUID(term) ) {
        product =  await this.productRepository.findOneBy({ id: term });
      } else {

        const queryBuilder = this.productRepository.createQueryBuilder('prod');
        product = await queryBuilder.where('UPPER(title) =:title or slug =:slug',{
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();

      }

      if ( !product )
        throw new NotFoundException( `Product with term ${ term } not found.` )

      return product;
    } catch (error) {
      console.log(error);
      throw new NotFoundException( `Product with ${ term } not found` )

      // this.handleDbExceptions(error);
    }
  }

  async findOnePlain ( term: string ) {

    const { images= [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( image => image.url )
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate, })

    if ( !product ) {
      throw new NotFoundException(` Product with id ${ id } not found`)
    }

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    // crear transaccion a partir de un query runner

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if ( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } } );

        product.images = images.map(
          image => this.productImageRepository.create( { url: image } )
        )

      }

      await queryRunner.manager.save( product );
      // await this.productRepository.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain( id );
      
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDbExceptions(error);
    }

  }

  async remove(id: string) {

    // try {
      const product  = await this.productRepository.findOneBy({ id });

      const deleted  = await this.productRepository.remove(product);
      return deleted;
    // } catch (error) {
    // }
  }

  private handleDbExceptions( error : any) {

    if ( error.code === '23505' ) 
    throw new BadRequestException( error.detail )

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs')
  
  }

  async deleteAllProducts() {

    const query = this.productRepository.createQueryBuilder('product');

    try {
      
      return await query
        .delete()
        .where({})
        .execute()


    } catch (error) {

      this.handleDbExceptions(error)
      
    }

  }
   

}
