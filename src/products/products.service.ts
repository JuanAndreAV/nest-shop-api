import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
//import { isUUID } from 'class-validator';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger("ProductsService")

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
      this.handleDbExceptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto
   return await this.productRepository.find({
    take: limit,
    skip: offset
   })
  }

  async findOne(term: string) {
    let producto: Product | null
    if(isUUID(term)){
      producto = await this.productRepository.findOneBy({id: term}) 
    }else{
      //producto = await this.productRepository.findOneBy({slug: term})
      const queryBuilder = this.productRepository.createQueryBuilder()
      producto = await queryBuilder.where('UPPER(title)  =:title or slug =:slug', {
        title: term.toUpperCase(),
        slug: term
      }).getOne()
    }
    
    //const producto = await this.productRepository.findOneBy({id})
    if(!producto){
      throw new BadRequestException(`Product with id: ${term} not found`)
    }
     return producto
    
  }

 async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });
    if(!product) throw new NotFoundException(`Product with id: ${id} not found`)
    try {
      await this.productRepository.save(product)
      return product;
    } catch (error) {
      this.handleDbExceptions(error)
    }
    
  }

  async remove(id: string) {
   try {
      const producto = await this.findOne(id)
     
      await this.productRepository.remove(producto)
      return producto
   } catch (error) {
    throw new BadRequestException(error.detail);
   }
  }

  //manejo de errores
  private handleDbExceptions(error: any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);

     this.logger.error(error)
      throw new InternalServerErrorException('Can not create a product')

  }


}
