import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager'
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import {
  Car,
  type CarID,
  CarState,
  CarTypeNotFoundError,
  ICarService,
  type User,
} from '../../application'
import { NotCarOwnerError } from '../../application/car/error'
import { DuplicateLicensePlateError } from '../../application/car/error/duplicate-license-plate.error'
import { AuthenticationGuard } from '../authentication.guard'
import { CurrentUser } from '../current-user.decorator'

import { CarDTO, CreateCarDTO, PatchCarDTO } from './car.dto'

@ApiTags(Car.name)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description:
    'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
})
@ApiInternalServerErrorResponse({
  description: 'An internal server error occurred.',
})
@UseGuards(AuthenticationGuard)
@Controller('/cars')
@UseInterceptors(CacheInterceptor)
export class CarController {
  private readonly carService: ICarService

  public constructor(carService: ICarService) {
    this.carService = carService
  }

  // Please remove the next line when implementing this file.
  /* eslint-disable @typescript-eslint/require-await */

  @ApiOperation({
    summary: 'Retrieve all cars.',
  })
  @Get()
  @CacheKey('cars')
  public async getAll(): Promise<CarDTO[]> {
    return this.carService.getAll()
  }

  @ApiOperation({
    summary: 'Retrieve a specific car.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: CarDTO,
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiNotFoundResponse({
    description: 'No car with the given id was found.',
  })
  @Get(':id')
  @CacheKey('car')
  public async get(@Param('id', ParseIntPipe) _id: CarID): Promise<CarDTO> {
    return CarDTO.fromModel(await this.carService.get(_id))
  }

  @ApiOperation({
    summary: 'Create a new car.',
  })
  @ApiCreatedResponse({
    description: 'A new car was created.',
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiConflictResponse({
    description: 'A car with the given license plate already exists.',
  })
  @Post()
  public async create(
    @CurrentUser() owner: User,
    @Body() data: CreateCarDTO,
  ): Promise<CarDTO> {
    try {
      const carData = await this.carService.create({
        ...data,
        ownerId: owner.id,
        state: CarState.LOCKED,
      })
      return CarDTO.fromModel(carData)
    } catch (error: unknown) {
      if (error instanceof DuplicateLicensePlateError) {
        throw new BadRequestException(error.message)
      }
      if (error instanceof CarTypeNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }

  @ApiOperation({
    summary: 'Update an existing car.',
  })
  @ApiOkResponse({
    description: 'The car was updated.',
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiNotFoundResponse({
    description: 'No car with the given id was found.',
  })
  @Patch(':id')
  public async patch(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) carId: CarID,
    @Body() data: PatchCarDTO,
  ): Promise<CarDTO> {
    try {
      const car = await this.carService.update(carId, data, user.id)
      return CarDTO.fromModel(car)
    } catch (error: unknown) {
      if (error instanceof NotCarOwnerError) {
        throw new ForbiddenException(
          'You are not authorized to update this car',
        )
      }
      if (error instanceof DuplicateLicensePlateError) {
        throw new BadRequestException(error.message)
      }
      const reason = (error as Error).message
      throw new BadRequestException(reason)
    }
  }
}
