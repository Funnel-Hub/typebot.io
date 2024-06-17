export const cancelEvent = 'const response = await fetch(\n' +
  '  "https://calendar.funnelhub.io/api/integrations/funnelhub/bookings/" + {{BOOKING_ID}} + "/cancel",\n' +
  '  {\n' +
  '    method: "DELETE"\n' +
  '  }\n' +
  ')\n' +
  '\n' +
	'if (response.ok) {\n' +
	'  setVariable("BOOKING_ID", "null")\n' +
  '  setVariable("BOOKED_DATE", "null")\n' +
	'}\n' +
  '\n' +
  'const cancellationConfirmation = await response.json()\n' +
  'return cancellationConfirmation'
