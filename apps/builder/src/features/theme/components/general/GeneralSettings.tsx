import { Stack, useDisclosure } from '@chakra-ui/react'
import { Background, Theme } from '@typebot.io/schemas'
import React from 'react'
import { BackgroundSelector } from './BackgroundSelector'
import { FontSelector } from './FontSelector'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { useTranslate } from '@tolgee/react'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'

type Props = {
  generalTheme: Theme['general']
  onGeneralThemeChange: (general: Theme['general']) => void
}

export const GeneralSettings = ({
  generalTheme,
  onGeneralThemeChange,
}: Props) => {
  const { t } = useTranslate()
  const { isOpen, onClose } = useDisclosure()

  const handleSelectFont = (font: string) =>
    onGeneralThemeChange({ ...generalTheme, font })

  const handleBackgroundChange = (background: Background) =>
    onGeneralThemeChange({ ...generalTheme, background })

  return (
    <Stack spacing={6}>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={t('billing.limitMessage.brand')}
      />
      <FontSelector
        activeFont={generalTheme?.font ?? defaultTheme.general.font}
        onSelectFont={handleSelectFont}
      />
      <BackgroundSelector
        background={generalTheme?.background ?? defaultTheme.general.background}
        onBackgroundChange={handleBackgroundChange}
      />
    </Stack>
  )
}
