import { NotFoundException, BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

  ) {}

  async create(createProductDto: CreateProductDto) {
    
    try {
      
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product

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
      });
      return product
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findOne(id: string) {

    try {
      const product  = await this.productRepository.findOneBy({ id });
      if ( !product )
        throw new NotFoundException( `Product with id ${ id } not found.` )

      return product;
    } catch (error) {
      console.log(error);
      throw new NotFoundException( `Product with id ${ id } not found` )

      // this.handleDbExceptions(error);
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {

    try {
      const product  = await this.productRepository.findOneBy({ id });

      const deleted  = await this.productRepository.remove(product);
      return deleted;
    } catch (error) {
    }
    return `This action removes a #${id} product`;
  }

  private handleDbExceptions( error : any) {

    if ( error.code === '23505' ) 
    throw new BadRequestException( error.detail )

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs')
  
  }
   

}
