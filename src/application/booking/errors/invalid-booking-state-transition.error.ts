import { BookingState } from '../booking-state'

export class InvalidBookingStateTransitionError extends Error {
  constructor(currentState: BookingState, newState: BookingState) {
    super(`Invalid state transition from ${currentState} to ${newState}`)
    this.name = 'InvalidBookingStateTransitionError'
  }
}
