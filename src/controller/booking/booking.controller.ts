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
  UnauthorizedException,
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
  UserID,
} from '../../application'
import { InvalidBookingStateTransitionError } from '../../application/booking/errors/invalid-booking-state-transition.error'
import { AuthenticationGuard } from '../authentication.guard'
import { CurrentUser } from '../current-user.decorator'

import { BookingDTO, CreateBookingDTO, PatchBookingDTO } from './booking.dto'
import dayjs from 'dayjs'

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
    summary: 'Return all bookings.',
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
    // eslint-disable-next-line unicorn/no-await-expression-member
    return (await this.bookingService.getAll()).map(booking =>
      BookingDTO.fromModel(booking),
    )
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retrieve a specific booking.',
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
    description: 'No booking with the given id was found.',
  })
  @Get(':id')
  public async get(
    @Param('id', ParseIntPipe) id: BookingID,
    @CurrentUser() currentUser: User,
  ): Promise<BookingDTO> {
    return BookingDTO.fromModel(await this.bookingService.get(id, currentUser.id))
  }
  
  @Post()
  public async create(
    @CurrentUser() renter: User,
    @Body() data: CreateBookingDTO,
  ): Promise<BookingDTO> {
    try {
      const { startDate, endDate } = data
      if (
        dayjs(startDate).isBefore(dayjs(new Date())) ||
        dayjs(endDate).isBefore(dayjs(startDate))
      ) {
        throw new BadRequestException('End date must come after start date')
      }
      const bookingData = await this.bookingService.create({
        ...data,
        renterId: renter.id,
        state: BookingState.PENDING,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      return BookingDTO.fromModel(bookingData)
    } catch (error: unknown) {
      if (error instanceof BookingNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }

  @ApiOperation({
    summary: 'Update an existing booking',
  })
  @ApiOkResponse({
    description: 'The booking was updated',
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g missing or invalid credentials or preperty in the request body',
  })
  @ApiNotFoundResponse({
    description: 'No booking with the given id was found',
  })
  @Patch(':id')
  public async patch(
    @Param('id', ParseIntPipe) bookingId: BookingID,
    @Param('id', ParseIntPipe) renterId: UserID,
    @Body() data: PatchBookingDTO,
  ): Promise<BookingDTO> {
    try {
      const updates: {
        endDate?: Date
        startDate?: Date
        state?: BookingState
      } = {}
      if (data.endDate) updates.endDate = new Date(data.endDate)
      if (data.startDate) updates.startDate = new Date(data.startDate)
      if (data.state) updates.state = data.state

      const updatedBooking = await this.bookingService.update(
        bookingId,
        {
          ...updates,
        },
        renterId,
      )
      return BookingDTO.fromModel(updatedBooking)
    } catch (error) {
      if (error instanceof InvalidBookingStateTransitionError) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }
}
