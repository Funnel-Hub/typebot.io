import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { PrimitiveList } from '@/components/PrimitiveList'
import { TextInput } from '@/components/inputs'
import { FormControl, FormLabel, Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { env } from '@typebot.io/env'
import { isDefined } from '@typebot.io/lib'
import { Settings } from '@typebot.io/schemas'

type Props = {
  security: Settings['security']
  onUpdate: (security: Settings['security']) => void
}

export const SecurityForm = ({ security, onUpdate }: Props) => {
  const { t } = useTranslate()
  const updateItems = (items: string[]) => {
    if (items.length === 0) onUpdate(undefined)
    onUpdate({
      allowedOrigins: items.filter(isDefined),
    })
  }

  return (
    <Stack spacing={6}>
      <FormControl>
        <FormLabel display="flex" flexShrink={0} gap="1" mr="0" mb="4">
          {t('settings.settingsSideMenu.settingsMenu.title')}
          <MoreInfoTooltip>
            {t('settings.settingsSideMenu.settingsMenu.titleTooltip')}
          </MoreInfoTooltip>
        </FormLabel>
        <PrimitiveList
          initialItems={security?.allowedOrigins}
          onItemsChange={updateItems}
          addLabel={t('settings.settingsSideMenu.settingsMenu.addURL')}
        >
          {({ item, onItemChange }) => (
            <TextInput
              width="full"
              defaultValue={item}
              onChange={onItemChange}
              placeholder={env.NEXT_PUBLIC_VIEWER_URL[0]}
            />
          )}
        </PrimitiveList>
      </FormControl>
    </Stack>
  )
}
