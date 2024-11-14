import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import {
  Booking,
  type BookingID,
  BookingNotFoundError,
  BookingState,
  IBookingService,
  type User,
} from 'src/application'

import { AuthenticationGuard } from '../authentication.guard'
import { CurrentUser } from '../current-user.decorator'

import { BookingDTO, CreateBookingDTO } from './booking.dto'

@ApiTags(Booking.name)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description:
    'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
})
@ApiInternalServerErrorResponse({
  description: 'An internal server error occurred.',
})
@UseGuards(AuthenticationGuard)
@Controller('/bookings')
export class BookingController {
  private readonly bookingService: IBookingService

  public constructor(bookingService: IBookingService) {
    this.bookingService = bookingService
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Return all registered users.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: BookingDTO,
  })
  @ApiUnauthorizedResponse({
    description:
      'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
  })
  @Get()
  public async getAll(): Promise<BookingDTO[]> {
    console.log('getAll')
    return this.bookingService.getAll()
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retrieve a specific user.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: BookingDTO,
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiNotFoundResponse({
    description: 'No user with the given id was found.',
  })
  @Get(':id')
  public async get(
    @Param('id', ParseIntPipe) id: BookingID,
  ): Promise<BookingDTO> {
    return BookingDTO.fromModel(await this.bookingService.get(id))
  }
  @Post()
  public async create(
    @CurrentUser() renter: User,
    @CurrentUser() owner: User,
    @Body() data: CreateBookingDTO,
  ): Promise<BookingDTO> {
    try {
      const bookingData = await this.bookingService.create({
        ...data,
        renterId: renter.id,
        ownerId: owner.id,
        state: BookingState.PENDING,
      })
      return BookingDTO.fromModel(bookingData)
    } catch (error: unknown) {
      if (error instanceof BookingNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
