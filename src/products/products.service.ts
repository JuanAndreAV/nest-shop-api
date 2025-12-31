import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, DataSource } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
//import { isUUID } from 'class-validator';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product.image.entity';
//import { DataSource } from 'typeorm/browser';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger("ProductsService")

  //Inyecto el typeorm en el constructor
    constructor(
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
      @InjectRepository(ProductImage)
      private readonly productImageRepository: Repository<ProductImage>,
      private readonly dataSource: DataSource
    ){}

  async create(createProductDto: CreateProductDto) {
    try { 
      const { images = [], ...productDetails  } = createProductDto
      const product =  this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({url: image}))
      })
      await this.productRepository.save(product)
      return {...product, images: images}
      
    } catch (error) {
      this.handleDbExceptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto
   const products = await this.productRepository.find({
    take: limit,
    skip: offset,
    relations: {
      images: true
    }
   })
   return products.map(product =>({
    ...product,
    images: product.images?.map(img => img.url)
   }))
  }

  async findOne(term: string) {
    let producto: Product | null
    if(isUUID(term)){
      producto = await this.productRepository.findOneBy({id: term}) 
    }else{
      //producto = await this.productRepository.findOneBy({slug: term})
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      producto = await queryBuilder.where('UPPER(title)  =:title or slug =:slug', {
        title: term.toUpperCase(),
        slug: term
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne()
    }
    
    //const producto = await this.productRepository.findOneBy({id})
    if(!producto){
      throw new BadRequestException(`Product with id: ${term} not found`)
    }
     return producto
  }
  async findOnePlain(term: string){
    const { images = [], ...rest } = await this.findOne(term)
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

 async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });
    if(!product) throw new NotFoundException(`Product with id: ${id} not found`);
    //create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    

    try {
      if(images){
        await queryRunner.manager.delete(ProductImage, {product: {id}});
        product.images = images.map(image => this.productImageRepository.create({url: image}))
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      //await this.productRepository.save(product)
      //return product;
      return this.findOnePlain(id)
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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

  };

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product')
    try {
      return await query
      .delete()
      .where({})
      .execute()
    } catch (error) {
      this.handleDbExceptions(error)
    }
    
  };


}
