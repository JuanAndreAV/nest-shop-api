import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  //Inyecto el typeorm en el constructor
    constructor(
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
    ){}

  async create(createProductDto: CreateProductDto) {
    try { 
      const product =  this.productRepository.create(createProductDto)
      await this.productRepository.save(product)
      return product
      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Can not create a product')
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
