
import { 
    Entity, PrimaryGeneratedColumn, 
    Column, BeforeInsert, BeforeUpdate, 
    OneToMany, 
    ManyToOne
} from 'typeorm'
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: 'a5300627-2f71-4f47-88ac-6efda7420190',
        description: 'Product id',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'polos nike',
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: 100,
        description: 'Product price',
        default: 0
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'esta es el polo bien chido',
        description: 'Product description',
        uniqueItems: true
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 'polos_nike',
        description: 'Product slug',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 50,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product sizes',
    })
    @Column('text', {
        array:  true
    })
    sizes: string[];

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product sizes',
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product sizes',
    })
    @Column('text',{
        default: [],
        array:  true
    })
    tags: string[];

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product sizes',
    })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { 
            cascade: true,
            eager: true
        }
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true } // ayuda a traer a los usuarios que estan relacionados con este producto
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {

        if ( !this.slug ) {
            this.slug = this.title
          } 

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(" ", "_")
        .replaceAll("'", "")
    }

    @BeforeUpdate()
    checkSlugUpdate() {

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(" ", "_")
        .replaceAll("'", "")
    }

}
