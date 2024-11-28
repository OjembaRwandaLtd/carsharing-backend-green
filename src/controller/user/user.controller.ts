import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { UserAlreadyExistError } from 'src/application/user/user-already-exist.error'

import { IUserService, User, type UserID } from '../../application'
import { Role } from '../../application/role.enum'
import { AuthenticationGuard } from '../authentication.guard'
import { Roles } from '../roles.decorator'

import { CreateUserDTO, UserDTO } from './user.dto'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *     ██╗     PROCEED WITH CAUTION                                                                                    *
 *     ██║                                                                                                             *
 *     ██║     This file implements some core functionality for the application. You will not need to modify or        *
 *     ╚═╝     fully understand this file to successfully finish your project.                                         *
 *     ██╗                                                                                                             *
 *     ╚═╝     That said, feel free to browse around and try things - you can always revert your changes!              *
 *                                                                                                                     *
 \*********************************************************************************************************************/

@ApiTags(User.name)
@ApiInternalServerErrorResponse({
  description: 'An internal server error occurred.',
})
@UseGuards(AuthenticationGuard)
@Controller('/users')
export class UserController {
  private readonly userService: IUserService

  public constructor(authenticationService: IUserService) {
    this.userService = authenticationService
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Return all registered users.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: [UserDTO],
  })
  @ApiUnauthorizedResponse({
    description:
      'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
  })
  @Get()
  public async getAll(): Promise<UserDTO[]> {
    const users = await this.userService.getAll()

    return users.map(user => UserDTO.fromModel(user))
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retrieve a specific user.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: UserDTO,
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiNotFoundResponse({
    description: 'No user with the given id was found.',
  })
  @Get(':id')
  public async get(@Param('id', ParseIntPipe) id: UserID): Promise<UserDTO> {
    const user = await this.userService.get(id)

    return UserDTO.fromModel(user)
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new user.',
  })
  @ApiCreatedResponse({
    description: 'A new user was created.',
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiBody({ type: CreateUserDTO })
  @Roles(Role.ADMIN)
  @Post()
  public async create(@Body() user: CreateUserDTO): Promise<UserDTO> {
    try {
      const newUser = await this.userService.create(user)
      return UserDTO.fromModel(newUser)
    } catch (error) {
      if (error instanceof UserAlreadyExistError) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }
}
