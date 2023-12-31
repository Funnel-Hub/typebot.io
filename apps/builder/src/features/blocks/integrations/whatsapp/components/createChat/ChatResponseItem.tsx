import { DropdownList } from '@/components/DropdownList'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { TableListItemProps } from '@/components/TableList'
import { Stack } from '@chakra-ui/react'
import { Variable } from '@typebot.io/schemas'
import { ChatWhatsappOptions } from '@typebot.io/schemas/features/blocks/integrations/whatsapp'
import {
  whatsappChatResponseValues,
  defaultWhatsappResponseMappingItem,
} from '@typebot.io/schemas/features/blocks/integrations/whatsapp/constants'

type Props = TableListItemProps<
  NonNullable<ChatWhatsappOptions['responseMapping']>[number]
>

export const ChatResponseItem = ({ item, onItemChange }: Props) => {
  const changeValueToExtract = (
    valueToExtract: (typeof whatsappChatResponseValues)[number]
  ) => {
    onItemChange({ ...item, valueToExtract })
  }

  const changeVariableId = (variable: Pick<Variable, 'id'> | undefined) => {
    onItemChange({ ...item, variableId: variable ? variable.id : undefined })
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList
        currentItem={
          item.valueToExtract ?? defaultWhatsappResponseMappingItem.valueToExtract
        }
        items={whatsappChatResponseValues}
        onItemSelect={changeValueToExtract}
      />
      <VariableSearchInput
        onSelectVariable={changeVariableId}
        initialVariableId={item.variableId}
      />
    </Stack>
  )
}
