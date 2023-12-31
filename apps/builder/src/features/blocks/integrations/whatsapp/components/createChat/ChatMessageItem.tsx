import { DropdownList } from '@/components/DropdownList'
import { Textarea } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { TableListItemProps } from '@/components/TableList'
import { HStack, Stack, Text } from '@chakra-ui/react'
import { Variable } from '@typebot.io/schemas'
import { ChatWhatsappOptions } from '@typebot.io/schemas/features/blocks/integrations/whatsapp'
import {
  whatsappChatMessageCustomRoles,
  whatsappChatMessageRoles,
} from '@typebot.io/schemas/features/blocks/integrations/whatsapp/constants'

type Props = TableListItemProps<
  NonNullable<ChatWhatsappOptions['messages']>[number]
>

const roles = [
  ...whatsappChatMessageCustomRoles,
  ...whatsappChatMessageRoles,
]

export const ChatMessageItem = ({ item, onItemChange }: Props) => {
  const changeRole = (role: (typeof roles)[number]) => {
    onItemChange({
      ...item,
      role,
      content: undefined,
    })
  }

  const changeSingleMessageContent = (content: string) => {
    if (item.role === 'Messages sequence ✨' || item.role === 'Dialogue') return
    onItemChange({ ...item, content })
  }

  const updateDialogueVariableId = (
    variable: Pick<Variable, 'id'> | undefined
  ) => {
    if (item.role !== 'Dialogue') return
    onItemChange({ ...item, dialogueVariableId: variable?.id })
  }

  const updateStartsBy = (startsBy: 'user' | 'assistant') => {
    if (item.role !== 'Dialogue') return
    onItemChange({ ...item, startsBy })
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList
        currentItem={item.role}
        items={roles}
        onItemSelect={changeRole}
        placeholder="Select type"
      />
      <ChatMessageItemContent
        item={item}
        onChangeSingleMessageContent={changeSingleMessageContent}
        onChangeDialogueVariableId={updateDialogueVariableId}
        onStartsByChange={updateStartsBy}
      />
    </Stack>
  )
}

const ChatMessageItemContent = ({
  onChangeSingleMessageContent,
  onChangeDialogueVariableId,
  onStartsByChange,
  item,
}: {
  onChangeSingleMessageContent: (content: string) => void
  onChangeDialogueVariableId: (
    variable: Pick<Variable, 'id'> | undefined
  ) => void
  onStartsByChange: (startsBy: 'user' | 'assistant') => void
  item: NonNullable<ChatWhatsappOptions['messages']>[number]
}) => {
  switch (item.role) {
    case 'assistant':
    case 'user':
    case 'system':
      return (
        <Textarea
          defaultValue={item.content}
          onChange={onChangeSingleMessageContent}
          placeholder="Content"
          minH="150px"
        />
      )
    case 'Dialogue':
      return (
        <Stack alignItems="flex-end">
          <VariableSearchInput
            initialVariableId={item.dialogueVariableId}
            onSelectVariable={onChangeDialogueVariableId}
            placeholder="Dialogue variable"
          />
          <HStack>
            <Text>starts by</Text>
            <DropdownList
              size="sm"
              currentItem={item.startsBy ?? 'user'}
              onItemSelect={onStartsByChange}
              items={['user', 'assistant'] as const}
            />
          </HStack>
        </Stack>
      )
    case 'Messages sequence ✨':
      return null
  }
}
