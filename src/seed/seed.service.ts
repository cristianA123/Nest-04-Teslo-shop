import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { Product } from '../products/entities/product.entity';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor  (
    private readonly productsService: ProductsService
  ) {}

  async runSeed() {

    await this.insertNewProducts();

    return `seed execute`;
  }

  private async insertNewProducts() {

    // eliminar por seeder
    await this.productsService.deleteAllProducts();

    // crear por seeder

    const products = initialData.products;
    const insertPromises = [];

    products.forEach( products => {
      insertPromises.push(this.productsService.create( products ))
    } )

    await Promise.all( insertPromises )

    return true;

  }

}
