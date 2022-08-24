import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/users/entities/user.entity';
import { OAuthProviderEnum } from 'src/common/enum/oauth-provider.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRegion } from 'src/entities/user-region.entity';
import { ErrorException } from 'src/common/exception/error.exception';
import { ERROR_CODE, ERROR_MESSAGE } from 'src/common/constant/error-message';
import Product from 'src/products/entities/product.entity';
import { PaginationOptionDto } from 'src/common/pagination/pagination-option.dto';
import { DEFAULT_LIMIT } from 'src/common/constant/pagination';
import { Pagination } from 'src/common/pagination/pagination';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserRegion)
    private userRegionRepository: Repository<UserRegion>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findUserById(id: number) {
    return this.userRepository.findOne({
      relations: ['userRegions'],
      where: {
        id,
      },
    });
  }

  async findUserInfoById(id: number) {
    const userInfo: any = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.nickname', 'regions.id', 'regionNames'])
      .leftJoin('user.userRegions', 'regions')
      .leftJoin('regions.region', 'regionNames')
      .where('user.id = :userId', { userId: id })
      .getOne();

    const newRegions = userInfo.userRegions.map(
      (userRegion) => userRegion.region,
    );

    const result = {
      nickname: userInfo.nickname,
      regions: newRegions,
    };

    return result;
  }

  async findUserByNickname(nickname: string) {
    return this.userRepository.findOne({
      where: {
        nickname,
      },
    });
  }

  async findUserBySnsIdAndProvider(
    provider: OAuthProviderEnum,
    snsId: string,
  ): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: {
        provider,
        snsId,
      },
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  async addUserRegion(userId: number, regionId: number) {
    const exRegionData = await this.userRegionRepository.find({
      where: {
        userId,
      },
    });
    if (exRegionData.length >= 2) {
      throw new ErrorException(
        ERROR_MESSAGE.EXCEED_REGIONS,
        ERROR_CODE.EXCEED_REGIONS,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (exRegionData.find((a) => a.regionId === regionId)) {
      throw new ErrorException(
        ERROR_MESSAGE.DUPLICATE_REGION,
        ERROR_CODE.DUPLICATE_REGION,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.userRegionRepository.save({
      userId,
      regionId,
    });
  }

  async removeUserRegion(userId: number, regionId: number) {
    const exRegionData = await this.userRegionRepository.find({
      where: {
        userId,
      },
    });

    if (!exRegionData.length) {
      throw new ErrorException(
        ERROR_MESSAGE.NOT_FOUND_REGION,
        ERROR_CODE.NOT_FOUND_REGION,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (exRegionData.find((a) => a.regionId === regionId)) {
      return this.userRegionRepository.delete({
        userId,
        regionId,
      });
    }

    throw new ErrorException(
      ERROR_MESSAGE.NOT_APPLIED_REGION,
      ERROR_CODE.NOT_APPLIED_REGION,
      HttpStatus.BAD_REQUEST,
    );
  }

  async findUserLikeProducts(options: PaginationOptionDto, userId: number) {
    const { limit, page } = options;
    const take = limit || DEFAULT_LIMIT;
    const skip = (page - 1) * take;

    const [result, total] = await this.productRepository
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.title',
        'product.price',
        'product.createdAt',
        'user.id',
        'regions.id',
        'regionNames.name',
      ])
      .leftJoinAndSelect('product.images', 'image')
      .loadRelationCountAndMap('product.chatRoom', 'product.chatRoom')
      .leftJoinAndSelect('product.views', 'product.views')
      .leftJoinAndSelect('product.likes', 'product.likes')
      .leftJoin('product.user', 'user')
      .leftJoin('user.userRegions', 'regions')
      .leftJoin('regions.region', 'regionNames')
      .where('product.likes.userId = :userId', { userId })
      .take(take)
      .skip(skip)
      .getManyAndCount();

    const next = skip + take <= total;

    return new Pagination({
      paginationResult: result.map((product) => {
        return {
          ...product,
          hasView: !!product.views.length,
          views: product.views.length,
          isViewed: !!product.views.find(
            (viewInfo) => viewInfo.userId === userId,
          ),
          hasLike: !!product.likes.length,
          likes: product.likes.length,
          isLiked: !!product.likes.find(
            (likeInfo) => likeInfo.userId === userId,
          ),
        };
      }),
      total,
      next,
      nextPage: next ? page + 1 : null,
    });
  }
}
