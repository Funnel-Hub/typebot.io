import {
  Stack,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { Background, Font, ProgressBar, Theme } from '@typebot.io/schemas'
import React from 'react'
import { BackgroundSelector } from './BackgroundSelector'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { useTranslate } from '@tolgee/react'
import {
  defaultFontType,
  fontTypes,
} from '@typebot.io/schemas/features/typebot/theme/constants'
import { RadioButtons } from '@/components/inputs/RadioButtons'
import { FontForm } from './FontForm'
import { ProgressBarForm } from './ProgressBarForm'

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

  const updateFont = (font: Font) =>
    onGeneralThemeChange({ ...generalTheme, font })

  const updateFontType = (type: (typeof fontTypes)[number]) => {
    onGeneralThemeChange({
      ...generalTheme,
      font:
        typeof generalTheme?.font === 'string'
          ? { type }
          : { ...generalTheme?.font, type },
    })
  }

  const handleBackgroundChange = (background: Background) =>
    onGeneralThemeChange({ ...generalTheme, background })

  const updateProgressBar = (progressBar: ProgressBar) =>
    onGeneralThemeChange({ ...generalTheme, progressBar })

  const fontType =
    (typeof generalTheme?.font === 'string'
      ? 'Google'
      : generalTheme?.font?.type) ?? defaultFontType

  return (
    <Stack spacing={6}>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={t('billing.limitMessage.brand')}
      />
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Progress Bar
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <ProgressBarForm
              progressBar={generalTheme?.progressBar}
              onProgressBarChange={updateProgressBar}
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            {t('theme.sideMenu.global.font')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel as={Stack}>
            <RadioButtons
              options={fontTypes}
              defaultValue={fontType}
              onSelect={updateFontType}
            />
            <FontForm font={generalTheme?.font} onFontChange={updateFont} />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            {t('theme.sideMenu.global.background')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <BackgroundSelector
              background={generalTheme?.background}
              onBackgroundChange={handleBackgroundChange}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
