import { Text } from '@chakra-ui/react'
import { CalComBlock } from '@typebot.io/schemas'

type Props = {
  block: CalComBlock
}

export const CalComContent = ({ block }: Props) => {
  if (!block.options?.action) return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={1} pr="6">
      Book Event
    </Text>
  )
}
