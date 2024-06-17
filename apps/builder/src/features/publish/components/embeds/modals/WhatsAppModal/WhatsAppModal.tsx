import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Heading,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
  Text,
  OrderedList,
  ListItem,
  HStack,
  useDisclosure,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
} from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { ModalProps } from '../../EmbedButton'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { WhatsAppCredentialsModal } from './WhatsAppCredentialsModal'
import { TextLink } from '@/components/TextLink'
import { PublishButton } from '../../../PublishButton'
import { useParentModal } from '@/features/graph/providers/ParentModalProvider'
import { trpc } from '@/lib/trpc'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { TableList } from '@/components/TableList'
import { Comparison } from '@typebot.io/schemas'
import { DropdownList } from '@/components/DropdownList'
import { WhatsAppComparisonItem } from './WhatsAppComparisonItem'
import { AlertInfo } from '@/components/AlertInfo'
import { NumberInput } from '@/components/inputs'
import { defaultSessionExpiryTimeout } from '@typebot.io/schemas/features/whatsapp'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { isDefined } from '@typebot.io/lib/utils'
import { hasProPerks } from '@/features/billing/helpers/hasProPerks'
import { UnlockPlanAlertInfo } from '@/components/UnlockPlanAlertInfo'
import { PlanTag } from '@/features/billing/components/PlanTag'
import { LogicalOperator } from '@typebot.io/schemas/features/blocks/logic/condition/constants'
import { Select } from '@/components/inputs/Select'
import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { WhatsappLiteCredentialsModal } from './WhatsappLiteCredentialsModal'

export const WhatsAppModal = ({ isOpen, onClose }: ModalProps): JSX.Element => {
  const { typebot, updateTypebot, isPublished } = useTypebot()
  const { ref } = useParentModal()
  const { workspace } = useWorkspace()
  const {
    isOpen: isCredentialsModalOpen,
    onOpen,
    onClose: onCredentialsModalClose,
  } = useDisclosure()

  const whatsAppSettings = typebot?.settings.whatsApp
  const whatsappLiteSettings = typebot?.settings?.whatsappLite
  const { data: phoneNumberData } =
    trpc.whatsAppInternal.getPhoneNumber.useQuery(
      {
        credentialsId: typebot?.whatsAppCredentialsId as string,
      },
      {
        enabled: !!typebot?.whatsAppCredentialsId,
      }
    )

  const toggleEnableWhatsApp = (isChecked: boolean) => {
    if (!(selectedTypeWhatsapp === 'Whatsapp Lite') && !phoneNumberData?.id)
      return
    if (!typebot) return
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          ...(selectedTypeWhatsapp === 'Whatsapp Lite'
            ? {
                whatsappLite: {
                  ...typebot.settings.whatsappLite,
                  isEnabled: isChecked,
                },
              }
            : {
                whatsApp: {
                  ...typebot.settings.whatsApp,
                  isEnabled: isChecked,
                },
              }),
        },
      },
    })
  }

  const updateCredentialsId = (credentialsId: string | undefined) => {
    if (!typebot) return
    updateTypebot({
      updates: {
        whatsAppCredentialsId: credentialsId,
      },
    })
  }

  const updateStartConditionComparisons = (comparisons: Comparison[]) => {
    if (!typebot) return
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          ...(selectedTypeWhatsapp === 'Whatsapp Lite'
            ? {
                whatsappLite: {
                  ...typebot.settings.whatsappLite,
                  startCondition: {
                    logicalOperator:
                      typebot.settings.whatsappLite?.startCondition
                        ?.logicalOperator ?? LogicalOperator.AND,
                    comparisons,
                  },
                },
                whatsapp: undefined,
              }
            : {
                whatsApp: {
                  ...typebot.settings.whatsApp,
                  startCondition: {
                    logicalOperator:
                      typebot.settings.whatsApp?.startCondition
                        ?.logicalOperator ?? LogicalOperator.AND,
                    comparisons,
                  },
                },
                whatsappLite: undefined,
              }),
        },
      },
    })
  }

  const updateStartConditionLogicalOperator = (
    logicalOperator: LogicalOperator
  ) => {
    if (!typebot) return
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          ...(selectedTypeWhatsapp === 'Whatsapp Lite'
            ? {
                whatsappLite: {
                  ...typebot.settings.whatsappLite,
                  startCondition: {
                    comparisons:
                      typebot.settings.whatsappLite?.startCondition
                        ?.comparisons ?? [],
                    logicalOperator,
                  },
                },
                whatsapp: undefined,
              }
            : {
                whatsApp: {
                  ...typebot.settings.whatsApp,
                  startCondition: {
                    comparisons:
                      typebot.settings.whatsApp?.startCondition?.comparisons ??
                      [],
                    logicalOperator,
                  },
                },
                whatsappLite: undefined,
              }),
        },
      },
    })
  }

  const updateIsStartConditionEnabled = (isEnabled: boolean) => {
    if (!typebot) return
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          ...(selectedTypeWhatsapp === 'Whatsapp Lite'
            ? {
                whatsappLite: {
                  ...typebot.settings.whatsappLite,
                  startCondition: !isEnabled
                    ? undefined
                    : {
                        comparisons: [],
                        logicalOperator: LogicalOperator.AND,
                      },
                },
                whatsapp: undefined,
              }
            : {
                whatsApp: {
                  ...typebot.settings.whatsApp,
                  startCondition: !isEnabled
                    ? undefined
                    : {
                        comparisons: [],
                        logicalOperator: LogicalOperator.AND,
                      },
                },
                whatsappLite: undefined,
              }),
        },
      },
    })
  }

  const updateSessionExpiryTimeout = (sessionExpiryTimeout?: number) => {
    if (
      !typebot ||
      (sessionExpiryTimeout &&
        (sessionExpiryTimeout <= 0 || sessionExpiryTimeout > 48))
    )
      return
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          ...(selectedTypeWhatsapp === 'Whatsapp Lite'
            ? {
                whatsappLite: {
                  ...typebot.settings.whatsappLite,
                  sessionExpiryTimeout,
                },
                whatsapp: undefined,
              }
            : {
                whatsApp: {
                  ...typebot.settings.whatsApp,
                  sessionExpiryTimeout,
                },
                whatsappLite: undefined,
              }),
        },
      },
    })
  }

  const [selectedTypeWhatsapp, setSelectedTypeWhatsapp] = useState<
    string | undefined
  >(undefined)

  const whatsappLiteUpdateCredentialsId = (
    credentialsId: string | undefined
  ) => {
    if (!typebot) return
    updateTypebot({
      updates: {
        whatsappLiteCredentialsId: credentialsId,
      },
    })
  }

  const { t } = useTranslate()

  const {
    onOpen: onOpenWhatsappLite,
    isOpen: isOpenWhatsappLiteModal,
    onClose: onWhatsappLiteModalClose,
  } = useDisclosure()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent ref={ref}>
        <ModalHeader>
          <Heading size="md">WhatsApp</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6">
          {!hasProPerks(workspace) && (
            <UnlockPlanAlertInfo excludedPlans={['STARTER']}>
              Upgrade your workspace to <PlanTag plan="PRO" /> to be able to
              enable WhatsApp integration.
            </UnlockPlanAlertInfo>
          )}
          {!isPublished && phoneNumberData?.id && (
            <AlertInfo>You have modifications that can be published.</AlertInfo>
          )}
          <OrderedList spacing={4} pl="4">
            <ListItem>
              <Text>Selecione o tipo de integração whatsapp</Text>
              <Select
                items={['Whatsapp Cloud API', 'Whatsapp Lite']}
                selectedItem={selectedTypeWhatsapp}
                onSelect={(value) => setSelectedTypeWhatsapp(value)}
                placeholder="Tipo de integração"
              />
              {selectedTypeWhatsapp === 'Whatsapp Lite' && workspace && (
                <div style={{ marginTop: '8px' }}>
                  <WhatsappLiteCredentialsModal
                    isOpen={isOpenWhatsappLiteModal}
                    onClose={onWhatsappLiteModalClose}
                    onNewCredentials={whatsappLiteUpdateCredentialsId}
                  />
                  <CredentialsDropdown
                    type="whatsappLite"
                    workspaceId={workspace.id}
                    currentCredentialsId={
                      typebot?.whatsappLiteCredentialsId ?? undefined
                    }
                    onCredentialsSelect={whatsappLiteUpdateCredentialsId}
                    onCreateNewClick={onOpenWhatsappLite}
                    credentialsName={t(
                      'editor.blocks.integrations.whatsapp.WhatsappSettings.CredentialsDropdown.credentialsName'
                    )}
                  />
                </div>
              )}
              {selectedTypeWhatsapp === 'Whatsapp Cloud API' && (
                <HStack>
                  <Text>Select a phone number:</Text>
                  {workspace && (
                    <>
                      <WhatsAppCredentialsModal
                        isOpen={isCredentialsModalOpen}
                        onClose={onCredentialsModalClose}
                        onNewCredentials={updateCredentialsId}
                      />
                      <CredentialsDropdown
                        type="whatsApp"
                        workspaceId={workspace.id}
                        currentCredentialsId={
                          typebot?.whatsAppCredentialsId ?? undefined
                        }
                        onCredentialsSelect={updateCredentialsId}
                        onCreateNewClick={onOpen}
                        credentialsName="WA phone number"
                        size="sm"
                      />
                    </>
                  )}
                </HStack>
              )}
            </ListItem>
            {typebot?.whatsAppCredentialsId ||
              (typebot?.whatsappLiteCredentialsId && (
                <>
                  <ListItem>
                    <Accordion allowToggle>
                      <AccordionItem>
                        <AccordionButton justifyContent="space-between">
                          Configuração da integração
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel as={Stack} spacing="4" pt="4">
                          <HStack>
                            <NumberInput
                              max={48}
                              min={0}
                              width="100px"
                              label="Tempo de expiração da sessão:"
                              defaultValue={
                                selectedTypeWhatsapp === 'Whatsapp Cloud API'
                                  ? whatsAppSettings?.sessionExpiryTimeout
                                  : whatsappLiteSettings?.sessionExpiryTimeout
                              }
                              placeholder={defaultSessionExpiryTimeout.toString()}
                              moreInfoTooltip="Um número entre 0 e 48 que representa o tempo em horas para a sessão se expirar caso o usuário não interaja com o bot. A conversa será reiniciada caso o usuário mande a mensagem após o tempo de expiração do chat entre ele e o bot."
                              onValueChange={updateSessionExpiryTimeout}
                              withVariableButton={false}
                              suffix="horas"
                            />
                          </HStack>
                          <SwitchWithRelatedSettings
                            label={'Condição para iniciar o bot'}
                            initialValue={isDefined(
                              selectedTypeWhatsapp === 'Whatsapp Cloud API'
                                ? whatsAppSettings?.startCondition
                                : whatsappLiteSettings?.startCondition
                            )}
                            onCheckChange={updateIsStartConditionEnabled}
                          >
                            <TableList<Comparison>
                              initialItems={
                                selectedTypeWhatsapp === 'Whatsapp Cloud API'
                                  ? whatsAppSettings?.startCondition
                                      ?.comparisons
                                  : whatsappLiteSettings?.startCondition
                                      ?.comparisons ?? []
                              }
                              onItemsChange={updateStartConditionComparisons}
                              ComponentBetweenItems={() => (
                                <Flex justify="center">
                                  <DropdownList
                                    currentItem={
                                      selectedTypeWhatsapp ===
                                      'Whatsapp Cloud API'
                                        ? whatsAppSettings?.startCondition
                                            ?.logicalOperator
                                        : whatsappLiteSettings?.startCondition
                                            ?.logicalOperator
                                    }
                                    onItemSelect={
                                      updateStartConditionLogicalOperator
                                    }
                                    items={Object.values(LogicalOperator)}
                                    size="sm"
                                  />
                                </Flex>
                              )}
                              addLabel="Adicionar comparação"
                            >
                              {(props) => <WhatsAppComparisonItem {...props} />}
                            </TableList>
                          </SwitchWithRelatedSettings>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </ListItem>

                  <ListItem>
                    <SwitchWithLabel
                      isDisabled={!hasProPerks(workspace)}
                      label="Habilitar integração no whatsapp"
                      initialValue={
                        (selectedTypeWhatsapp === 'Whatsapp Cloud API'
                          ? typebot?.settings?.whatsApp?.isEnabled
                          : typebot?.settings.whatsappLite?.isEnabled) ?? false
                      }
                      onCheckChange={toggleEnableWhatsApp}
                      justifyContent="flex-start"
                    />
                  </ListItem>
                  <ListItem>
                    <HStack>
                      <Text>Publicar typebot:</Text>
                      <PublishButton size="sm" isMoreMenuDisabled />
                    </HStack>
                  </ListItem>
                  {phoneNumberData?.id && (
                    <ListItem>
                      <TextLink
                        href={`https://wa.me/${phoneNumberData.name}?text=Start`}
                        isExternal
                      >
                        Try it out
                      </TextLink>
                    </ListItem>
                  )}
                </>
              ))}
          </OrderedList>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
