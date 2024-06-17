export const bookEvent = 'const { start, ...responses } = fnParameters' +
  '\n' +
  'const body = {\n' +
  '  eventTypeId: {{EVENT_TYPE_ID}},\n' +
  '  start: start,\n' +
  '  responses: responses,\n' +
  '  metadata: {},\n' +
  '  timeZone: "America/Sao_Paulo",\n' +
  '  language: "pt-BR"\n' +
  '}\n' +
  '\n' +
  'const response = await fetch(\n' +
  '  "https://calendar.funnelhub.io/api/integrations/funnelhub/bookings",\n' +
  '  {\n' +
  '    method: "POST",\n' +
  '    headers: {\n' +
  '      "Content-Type": "application/json"\n' +
  '    },\n' +
  '    body: JSON.stringify(body)\n' +
  '  }\n' +
  ')\n' +
  '\n' +
  'const booking = await response.json()\n' +
  '\n' +
  'if (\n' +
  '  !booking.ok &&\n' +
  '  booking.message &&\n' +
  '  booking.message === "no_available_users_found_error"\n' +
  ') {\n' +
  '  return {\n' +
  '    message: "Appointment date is not available. Please, try to book another date."\n' +
  '  }\n' +
  '}\n' +
  '\n' +
  'setVariable("BOOKING_ID", booking.id)\n' +
  'setVariable("BOOKED_DATE", booking.startTime)\n' +
  '\n' +
  'return {\n' +
  '  status: booking.status\n' +
  '}'
