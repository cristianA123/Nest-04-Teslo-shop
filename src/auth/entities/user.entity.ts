
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Min } from 'class-validator';
import { Product } from 'src/products/entities';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true
    })
    email: string;

    @Column('text',{
        nullable: true,
        select: false
    })
    password: string;

    @Column('text', {
        nullable: true,
    })
    fullName: string;

    @Column( 'bool', {
        nullable: true,
        default: true
    } )
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];


    @OneToMany(
        ( ) => Product,
        ( product ) => product.user
    )
    product: Product;

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim()
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert()
    }


}
