import { DropdownList } from '@/components/DropdownList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import {
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { isDefined } from '@typebot.io/lib'
import { Settings } from '@typebot.io/schemas'
import {
  defaultSettings,
  rememberUserStorages,
} from '@typebot.io/schemas/features/typebot/settings/constants'

type Props = {
  generalSettings: Settings['general'] | undefined
  onGeneralSettingsChange: (generalSettings: Settings['general']) => void
}

export const GeneralSettingsForm = ({
  generalSettings,
  onGeneralSettingsChange,
}: Props) => {
  const { t } = useTranslate()

  const keyBg = useColorModeValue(undefined, 'gray.600')
  const toggleRememberUser = (isEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings?.rememberUser,
        isEnabled,
      },
    })

  const handleInputPrefillChange = (isInputPrefillEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isInputPrefillEnabled,
    })

  const handleHideQueryParamsChange = (isHideQueryParamsEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isHideQueryParamsEnabled,
    })

  const updateRememberUserStorage = (
    storage: NonNullable<
      NonNullable<Settings['general']>['rememberUser']
    >['storage']
  ) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings?.rememberUser,
        storage,
      },
    })

  return (
    <Stack spacing={6}>
      <SwitchWithLabel
        label={t('settings.settingsSideMenu.generalMenu.inputPrefill.label')}
        initialValue={
          generalSettings?.isInputPrefillEnabled ??
          defaultSettings.general.isInputPrefillEnabled
        }
        onCheckChange={handleInputPrefillChange}
        moreInfoContent={t(
          'settings.settingsSideMenu.generalMenu.inputPrefill.moreInfoContent'
        )}
      />
      <SwitchWithLabel
        label={t('settings.settingsSideMenu.generalMenu.hideQueryParams.label')}
        initialValue={
          generalSettings?.isHideQueryParamsEnabled ??
          defaultSettings.general.isHideQueryParamsEnabled
        }
        onCheckChange={handleHideQueryParamsChange}
        moreInfoContent={t(
          'settings.settingsSideMenu.generalMenu.hideQueryParams.moreInfoContent'
        )}
      />
      <SwitchWithRelatedSettings
        label={t('settings.settingsSideMenu.generalMenu.rememberUser.label')}
        moreInfoContent={t(
          'settings.settingsSideMenu.generalMenu.rememberUser.moreInfoContent'
        )}
        initialValue={
          generalSettings?.rememberUser?.isEnabled ??
          (isDefined(generalSettings?.isNewResultOnRefreshEnabled)
            ? !generalSettings?.isNewResultOnRefreshEnabled
            : false)
        }
        onCheckChange={toggleRememberUser}
      >
        <FormControl as={HStack} justifyContent="space-between">
          <FormLabel mb="0">
            {t(
              'settings.settingsSideMenu.generalMenu.rememberUser.formLabel.storage'
            )}
            :&nbsp;
            <MoreInfoTooltip>
              <Stack>
                <Text>
                  {t(
                    'settings.settingsSideMenu.generalMenu.rememberUser.formLabel.choose'
                  )}{' '}
                  <Tag size="sm" bgColor={keyBg}>session</Tag>{' '}
                  {t(
                    'settings.settingsSideMenu.generalMenu.rememberUser.formLabel.choose.session'
                  )}
                </Text>
                <Text>
                  {t(
                    'settings.settingsSideMenu.generalMenu.rememberUser.formLabel.choose'
                  )}{' '}
                  <Tag size="sm">local</Tag>{' '}
                  {t(
                    'settings.settingsSideMenu.generalMenu.rememberUser.formLabel.choose.local'
                  )}
                </Text>
              </Stack>
            </MoreInfoTooltip>
          </FormLabel>
          <DropdownList
            currentItem={generalSettings?.rememberUser?.storage ?? 'session'}
            onItemSelect={updateRememberUserStorage}
            items={rememberUserStorages}
          ></DropdownList>
        </FormControl>
      </SwitchWithRelatedSettings>
    </Stack>
  )
}
