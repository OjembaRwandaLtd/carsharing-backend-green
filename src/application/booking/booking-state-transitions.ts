import { BookingState } from './booking-state'

const validTransitions: Record<BookingState, BookingState[]> = {
  [BookingState.PENDING]: [BookingState.ACCEPTED, BookingState.DECLINED],
  [BookingState.ACCEPTED]: [BookingState.PICKED_UP],
  [BookingState.PICKED_UP]: [BookingState.RETURNED],
  [BookingState.DECLINED]: [],
  [BookingState.RETURNED]: [],
}

export { validTransitions }
