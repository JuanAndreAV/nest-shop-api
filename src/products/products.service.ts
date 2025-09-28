import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

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

  async findAll() {
   return await this.productRepository.find({})
  }

  async findOne(id: string) {
    const producto = await this.productRepository.findOneBy({id})
    if(!producto){
      throw new BadRequestException(`Product with id: ${id} not found`)
    }
    return producto
    
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
