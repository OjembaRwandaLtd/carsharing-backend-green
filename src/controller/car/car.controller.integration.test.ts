import { expect } from '@jest/globals'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  type CarID,
  CarState,
  ICarService,
  CarTypeNotFoundError,
  FuelType,
  CarTypeID,
  Car,
} from '../../application'
import { DuplicateLicensePlateError } from '../../application/car/error/duplicate-license-plate.error'
import { CarBuilder, UserBuilder } from '../../builders'
import {
  AuthenticationGuardMock,
  type CarServiceMock,
  mockCarService,
} from '../../mocks'
import { configureGlobalEnhancers } from '../../setup-app'
import { AuthenticationGuard } from '../authentication.guard'

import { CarController } from './car.controller'

describe('CarController', () => {
  const user = UserBuilder.from({
    id: 42,
    name: 'peter',
  }).build()

  const carOne = CarBuilder.from({
    id: 13,
    licensePlate: 'ABC123',
    ownerId: user.id,
    state: CarState.LOCKED,
    carTypeId: 1,
    horsepower: 200,
    name: 'Test Car One',
    fuelType: FuelType.ELECTRIC,
    info: '',
  }).build()

  const carTwo = CarBuilder.from({
    id: 42,
    licensePlate: 'XYZ789',
    ownerId: user.id,
    state: CarState.LOCKED,
    carTypeId: 2,
    horsepower: 300,
    name: 'Test Car Two',
    fuelType: FuelType.ELECTRIC,
    info: '',
  }).build()

  let app: INestApplication
  let carServiceMock: CarServiceMock
  let authenticationGuardMock: AuthenticationGuardMock

  beforeEach(async () => {
    carServiceMock = mockCarService()
    authenticationGuardMock = new AuthenticationGuardMock(user)

    const moduleReference = await Test.createTestingModule({
      imports: [],
      controllers: [CarController],
      providers: [
        {
          provide: ICarService,
          useValue: carServiceMock,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(authenticationGuardMock)
      .compile()

    app = moduleReference.createNestApplication()

    await configureGlobalEnhancers(app).init()
  })

  afterEach(() => app.close())

  describe('getAll', () => {
    it('should return all cars', async () => {
      carServiceMock.getAll.mockResolvedValue([carOne, carTwo])

      await request(app.getHttpServer())
        .get('/cars')
        .expect(HttpStatus.OK)
        .expect(response => {
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: 13,
                licensePlate: 'ABC123',
                ownerId: user.id,
                state: CarState.LOCKED,
                carTypeId: 1,
                horsepower: 200,
                name: 'Test Car One',
                fuelType: FuelType.ELECTRIC,
                info: '',
              }),
              expect.objectContaining({
                id: 42,
                licensePlate: 'XYZ789',
                ownerId: user.id,
                state: CarState.LOCKED,
                carTypeId: 2,
                horsepower: 300,
                name: 'Test Car Two',
                fuelType: FuelType.ELECTRIC,
                info: '',
              }),
            ]),
          )
        })
    })
  })

  describe('get', () => {
    it('should return a car', async () => {
      carServiceMock.get.mockResolvedValue(carOne)

      await request(app.getHttpServer())
        .get(`/cars/${carOne.id}`)
        .expect(HttpStatus.OK)
        .expect(response => {
          expect(response.body).toEqual(
            expect.objectContaining({
              id: 13,
              licensePlate: 'ABC123',
              ownerId: user.id,
              state: CarState.LOCKED,
              carTypeId: 1,
              horsepower: 200,
              name: 'Test Car One',
              fuelType: FuelType.ELECTRIC,
              info: '',
            }),
          )
        })
    })

    it('should return a 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .get('/cars/invalid')
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return a 404 for non-existent car', async () => {
      const carId = 99 as CarID
      carServiceMock.get.mockRejectedValue(new Error('Car not found'))

      await request(app.getHttpServer())
        .get(`/cars/${carId}`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('create', () => {
    it('should create a new car', async () => {
      const newCar = {
        licensePlate: 'NEW123',
        carTypeId: 1,
        horsepower: 250,
        name: 'Test Car',
        fuelType: FuelType.ELECTRIC,
        info: '',
      }

      const createdCar = {
        ...newCar,
        id: 100 as CarID,
        ownerId: user.id,
        state: CarState.LOCKED,
      } as Car

      carServiceMock.create.mockResolvedValue(createdCar)

      await request(app.getHttpServer())
        .post('/cars')
        .send(newCar)
        .expect(HttpStatus.CREATED)
        .expect(response => {
          expect(response.body).toEqual(
            expect.objectContaining({ ...createdCar }),
          )
        })
    })

    it('should return 400 for duplicate license plate', async () => {
      const newCar = {
        licensePlate: 'ABC123',
        carTypeId: 1,
        horsepower: 250,
      }

      carServiceMock.create.mockRejectedValue(
        new DuplicateLicensePlateError('ABC123'),
      )

      await request(app.getHttpServer())
        .post('/cars')
        .send(newCar)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 404 for non-existent car type', async () => {
      const newCar = {
        licensePlate: 'NEW123',
        carTypeId: 999,
        horsepower: 250,
        name: 'Test Car',
        fuelType: FuelType.ELECTRIC,
        info: '',
      }

      carServiceMock.create.mockRejectedValue(
        new CarTypeNotFoundError(newCar.carTypeId as CarTypeID),
      )

      await request(app.getHttpServer())
        .post('/cars')
        .send(newCar)
        .expect(HttpStatus.NOT_FOUND)
    })
  })

  describe('patch', () => {
    it('should update a car', async () => {
      const updates = {
        name: "Nsengi's car",
        info: '',
      }

      const updatedCar = {
        ...carOne,
        ...updates,
      }

      carServiceMock.update.mockResolvedValue(updatedCar)

      await request(app.getHttpServer())
        .patch(`/cars/${carOne.id}`)
        .send(updates)
        .expect(HttpStatus.OK)
        .expect(response => {
          console.log(response.body)
          expect(response.body).toEqual(expect.objectContaining(updatedCar))
        })
    })

    it('should return 400 for duplicate license plate during update', async () => {
      const updates = {
        licensePlate: 'XYZ789',
      }

      carServiceMock.update.mockRejectedValue(
        new DuplicateLicensePlateError('XYZ789'),
      )

      await request(app.getHttpServer())
        .patch(`/cars/${carOne.id}`)
        .send(updates)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 for invalid car id', async () => {
      await request(app.getHttpServer())
        .patch('/cars/invalid')
        .send({ horsepower: 400 })
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
