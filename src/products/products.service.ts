import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

	private readonly logger = new Logger('ProductService');

	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
	) {}

	async create(createProductDto: CreateProductDto) {
		try {
			const product = this.productRepository.create( createProductDto );
			await this.productRepository.save( product );
			return product;
		} 
		catch (error) {
			this.handeDBExceptions( error );
		}
	}

	findAll() {
		const products = this.productRepository.find({});
		return products;
	}

	async findOne(term: string) {
		let product: Product;
		if( isUUID(term)) {
			product = await this.productRepository.findOneBy({ id: term });
		}
		else{
			product = await this.productRepository.findOneBy({ slug: term });
		}

		//const product = await this.productRepository.findOneBy({ id });

		if( !product ) {
			throw new NotFoundException(`Product with term ${ term } not found.`)
		}

		return product;
	}

	update(id: number, updateProductDto: UpdateProductDto) {
		return `This action updates a #${id} product`;
	}

	async remove(id: string) {
		const product = await this.findOne( id );
		await this.productRepository.remove( product );
	}

	private handeDBExceptions( error: any ) {
		if( error.code === '23505' )
				throw new BadRequestException( error.detail );
			
		this.logger.error( error );
		throw new InternalServerErrorException('Unexpected error, check server logs');
	}
}
