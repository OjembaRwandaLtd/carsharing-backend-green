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
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
  } from '@nestjs/swagger'

  import { Booking, type BookingID, BookingNotFoundError, IBookingService, type User  } from 'src/application'
  import { AuthenticationGuard } from '../authentication.guard'
  import { BookingDTO } from './booking.dto'


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

    public constructor(bookingService: IBookingService){
      this.bookingService = bookingService
    }


    @ApiOperation({
      summary: 'Retrieve a specific car.',
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
      description: 'No car with the given id was found.',
    })
    @Get(':id')
    public async get(@Param('id', ParseIntPipe) _id: BookingID): Promise<BookingDTO> {
      return BookingDTO.fromModel(await this.bookingService.get(_id))
    }
  }
