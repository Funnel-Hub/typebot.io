import { createAction, option } from '@typebot.io/forge'
import { baseOptions } from '../baseOptions'
import { calendarApiBaseURL } from '../constants'
import { isEmpty } from '@typebot.io/lib'

export const getEventAvailability = createAction({
  name: 'Get event availability',
  baseOptions,
  options: option.object({
    username: option.string.layout({
      label: 'Calendar username',
      placeholder: 'username',
      isRequired: true,
    }),
		eventTypeId: option.string.layout({
      label: 'Event Type ID',
			placeholder: '1234',
			isRequired: true,
    }),
    dateFrom: option.string.layout({
      label: 'Date From',
      placeholder: 'Ex: 30-01-2024',
      isRequired: true,
			moreInfoTooltip: 'Date must have the following format: dd-mm-yyyy',
    }),
    dateTo: option.string.layout({
      label: 'Date To',
      placeholder: 'Ex: 01-02-2024',
      isRequired: true,
			moreInfoTooltip: 'Date must have the following format: dd-mm-yyyy',
    }),
    saveAvailabilityListInVariableId: option.string.layout({
      label: 'Save availability list',
      inputType: 'variableDropdown',
      isRequired: true,
    }),
  }),
  getSetVariableIds: ({ saveAvailabilityListInVariableId }) =>
    saveAvailabilityListInVariableId ? [saveAvailabilityListInVariableId] : [],
  run: {
    server: async ({
			logs,
      variables,
      options: {
        username,
				dateFrom,
				dateTo,
				eventTypeId,
        saveAvailabilityListInVariableId,
      },
    }) => {
			if (isEmpty(saveAvailabilityListInVariableId)) {
				logs.add('Required to save availability list in a variable')
        return
			}

			if (isEmpty(username)) {
				logs.add('Username is empty')
        return
			}

			if (isEmpty(eventTypeId)) {
				logs.add('Event Type ID is empty')
        return
			}

			if (isEmpty(dateFrom) || isEmpty(dateTo)) {
				logs.add('Date From and Date To is required')
        return
			}
		
			const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/

			if (!dateRegex.test(dateFrom) || !dateRegex.test(dateTo)) {
				logs.add('Date From and Date To fields must have the following format: dd-mm-yyyy')
				return
			}

			const formatedDateFrom = dateFrom?.split('-').reverse().join('-')
			const formatedDateTo = dateTo?.split('-').reverse().join('-')

      try {				
        const rawResponse = await fetch(
          `${calendarApiBaseURL}/availability?username=${username}&eventTypeId=${eventTypeId}&dateFrom=${formatedDateFrom}&dateTo=${formatedDateTo}`
        )
				
				const response = await rawResponse.json()
				
				if (!rawResponse.ok) {
					throw new Error(response)
				}

        const { timeZone, dateRanges } = response

        variables.set(saveAvailabilityListInVariableId, {
          timeZone,
          dateRanges,
        })
      } catch (error) {
				if (error instanceof Error) {
					logs.add(error.message)
				}
      }
    },
  },
})
