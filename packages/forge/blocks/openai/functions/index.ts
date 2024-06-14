import { bookEvent } from './bookEvent'
import { cancelEvent } from './cancelEvent'

export const eventFunctions = {
	book_event: bookEvent,
	cancel_event: cancelEvent
} as Record<string, string>
