import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { Product } from '../products/entities/product.entity';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {

  constructor  (
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async runSeed() {

    await this.deleteTable();
    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);

    return `seed execute`;
  }

  private async deleteTable() {

    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    
    await queryBuilder
    .delete()
    .where({})
    .execute()

  }

  private async insertUsers() {

    const seedUsers = initialData.users;

    const users: User[] = []

    seedUsers.forEach( user => {
      users.push( this.userRepository.create(user) )
    })

    const dbUsers = await this.userRepository.save(seedUsers)

    return dbUsers[0]

  }

  private async insertNewProducts( user: User ) {

    // eliminar por seeder
    await this.productsService.deleteAllProducts();

    // crear por seeder

    const products = initialData.products;
    const insertPromises = [];

    products.forEach( products => {
      insertPromises.push(this.productsService.create( products, user ))
    } )

    await Promise.all( insertPromises )

    return true;

  }

}
