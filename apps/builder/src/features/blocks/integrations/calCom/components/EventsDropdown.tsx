import { Select } from '@/components/inputs/Select'
import { trpc } from '@/lib/trpc'

type Props = {
  baseOrigin: string
  onChange: (event: string | undefined) => void
}

export const EventsDropdown = ({ baseOrigin, onChange }: Props) => {
  const { data } = trpc.calCom.listEvents.useQuery()

  return (
    <Select
      items={data?.events.map(({ event }) => ({
        label: event,
        value: baseOrigin + event,
      }))}
      placeholder="Choose an event"
      onSelect={onChange}
    />
  )
}
