import { TextInput } from '@/components/inputs'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { phoneMasks } from '@/helpers/phoneMasks'
import { Select, Stack, Text, useDisclosure } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { WhatsappBlock } from '@typebot.io/schemas/features/blocks/integrations/whatsapp'
import { useState } from 'react'
import InputMask from 'react-input-mask'
import { WhatsappCredentialsModal } from './WhatsappCredentialsModal'

type Props = {
  block: WhatsappBlock
  onOptionsChange: (options: WhatsappBlock['options']) => void
}

const phoneCountries = Object.keys(phoneMasks)

function selectPhoneInputTypeByPhoneString(value?: string) {
  return new RegExp(/^[0-9]+$/).test(value ?? '')
    ? 'phone_number'
    : //eslint-disable-next-line no-extra-boolean-cast
    !!value
      ? 'variable'
      : undefined
}

export const WhatsappSettings = ({
  block: { options },
  onOptionsChange,
}: Props) => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<keyof typeof phoneMasks>(options?.countryCode as keyof typeof phoneMasks ?? 'BR')
  const [selectedMask, setSelectedMask] = useState<string>(
    phoneMasks[selectedCountryCode]
  )
  const [phoneNumberWithMask, setPhoneNumberWithMask] = useState(options?.phone)
  const [phoneInputType, setPhoneInputType] = useState(
    selectPhoneInputTypeByPhoneString(options?.phone)
  )
  const updateCredentialsId = (credentialsId: string | undefined) => {
    if (options) {
      onOptionsChange({
        ...options,
        credentialsId,
      })
    } else {
      onOptionsChange({
        credentialsId,
      })
    }
  }

  const handlePhoneNumbersChange = (phone: string) => {
    if (!phone) return
    setPhoneNumberWithMask(phone)
    onOptionsChange({
      ...options,
      phone: phone.trim().replace(/[^0-9]/g, ''),
      countryCode: selectedCountryCode as string
    })
  }

  const handlePhoneNumberVariableChange = (value: string) => {
    onOptionsChange({
      ...options,
      phone: value.trim(),
    })
  }

  const handleChangeCountryCode = (item: keyof typeof phoneMasks) => {
    setSelectedMask(phoneMasks[item])
    setSelectedCountryCode(item)
  }

  const handleChangePhoneInputType = (value: string) => {
    if (value === phoneInputType) return
    onOptionsChange({
      ...options,
      phone: undefined,
    })
    setPhoneInputType(value)
  }

  return (
    <Stack>
      {workspace && (
        <>
          <CredentialsDropdown
            type="whatsAppSocket"
            workspaceId={workspace.id}
            currentCredentialsId={options?.credentialsId ?? undefined}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={onOpen}
            credentialsName={t(
              'editor.blocks.integrations.whatsapp.WhatsappSettings.CredentialsDropdown.credentialsName'
            )}
          />
          <WhatsappCredentialsModal
            isOpen={isOpen}
            onClose={onClose}
            onNewCredentials={updateCredentialsId}
          />
        </>
      )}
      {options?.credentialsId && (
        <>
          <Text fontSize="lg" mt="3">
            {t(
              'editor.blocks.integrations.whatsapp.WhatsappSettings.CredentialsDropdown.sendMessageTo'
            )}
          </Text>
          <Select
            placeholder={t(
              'editor.blocks.integrations.whatsapp.WhatsappSettings.CredentialsDropdown.choiceTypePhoneInput'
            )}
            onChange={(e) => handleChangePhoneInputType(e.target.value)}
            defaultValue={phoneInputType}
          >
            <option value="phone_number">
              {t(
                'editor.blocks.integrations.whatsapp.WhatsappSettings.CredentialsDropdown.phoneNumber'
              )}
            </option>
            <option value="variable">
              {t(
                'editor.blocks.integrations.whatsapp.WhatsappSettings.CredentialsDropdown.variable'
              )}
            </option>
          </Select>
          {phoneInputType === 'phone_number' && (
            <Stack display="flex" direction="row">
              <Select
                onChange={(e) =>
                  handleChangeCountryCode(
                    e.target.value as keyof typeof phoneMasks
                  )
                }
                value={selectedCountryCode}
              >
                {phoneCountries.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Select>
              <InputMask
                mask={selectedMask}
                value={!options.phone ? '' : phoneNumberWithMask}
                placeholder="999999999999"
                onChange={(event) =>
                  handlePhoneNumbersChange(event.target.value)
                }
                style={{ border: '1px solid #ccc', padding: '0.2rem' }}
              />
            </Stack>
          )}
          {phoneInputType === 'variable' && (
            <TextInput
              defaultValue={options.phone}
              onChange={(value) => handlePhoneNumberVariableChange(value)}
              onlySelectVariable
            />
          )}
        </>
      )}
    </Stack>
  )
}
