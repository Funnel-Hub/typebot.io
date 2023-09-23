import {
  Stack,
  Heading,
  chakra,
  HStack,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Text,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@/components/icons'
import { Plan } from '@typebot.io/prisma'
import { useEffect, useState } from 'react'
import { isDefined, parseNumberWithCommas } from '@typebot.io/lib'
import {
  chatsLimit,
  computePrice,
  formatPrice,
  getChatsLimit,
} from '@typebot.io/lib/pricing'
import { FeaturesList } from './FeaturesList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { I18nFunction, useI18n } from '@/locales'
import { Workspace } from '@typebot.io/schemas'

type Props = {
  scopedT: I18nFunction,
  highlights: boolean,
  isSelectPlan: boolean,
  workspace: Pick<
    Workspace,
    | 'additionalChatsIndex'
    | 'plan'
    | 'customChatsLimit'
    | 'customStorageLimit'
    | 'stripeId'
  >
  currentSubscription: {
    isYearly?: boolean
  }
  currency?: 'eur' | 'usd' | 'brl'
  isLoading?: boolean
  isYearly: boolean
  onPayClick: (props: { selectedChatsLimitIndex: number }) => void
}

export const StarterPlanPricingCard = ({
  scopedT,
  highlights,
  isSelectPlan,
  workspace,
  currentSubscription,
  isLoading,
  currency,
  isYearly,
  onPayClick,
}: Props) => {
  const t = useI18n()
  const [selectedChatsLimitIndex, setSelectedChatsLimitIndex] =
    useState<number>()

  useEffect(() => {
    if (isDefined(selectedChatsLimitIndex)) return
    if (workspace.plan !== Plan.STARTER) {
      setSelectedChatsLimitIndex(0)
      return
    }
    setSelectedChatsLimitIndex(workspace.additionalChatsIndex ?? 0)
  }, [selectedChatsLimitIndex, workspace.additionalChatsIndex, workspace.plan])

  const workspaceChatsLimit = workspace ? getChatsLimit(workspace) : undefined

  const isCurrentPlan =
    chatsLimit[Plan.STARTER].graduatedPrice[selectedChatsLimitIndex ?? 0]
      .totalIncluded === workspaceChatsLimit &&
    isYearly === currentSubscription?.isYearly

  const getButtonLabel = () => {
    if (selectedChatsLimitIndex === undefined) return ''
    if (workspace?.plan === Plan.PRO) return t('downgrade')
    if (workspace?.plan === Plan.STARTER) {
      if (isCurrentPlan) return scopedT('pricingCard.upgradeButton.current')

      if (
        selectedChatsLimitIndex !== workspace.additionalChatsIndex ||
        isYearly !== currentSubscription?.isYearly
      )
      return isSelectPlan ? t('select') : t('update')
    }
    return isSelectPlan ? t('select') : t('upgrade')
  }

  const handlePayClick = async () => {
    if (selectedChatsLimitIndex === undefined) return
    onPayClick({
      selectedChatsLimitIndex,
    })
  }

  const price =
    computePrice(
      Plan.STARTER,
      selectedChatsLimitIndex ?? 0,
      isYearly ? 'yearly' : 'monthly'
    ) ?? NaN

  return (
    <Stack spacing={6} p="6" rounded="lg" borderWidth="1px" flex="1" h="full">
      <Stack spacing="4">
        <Heading fontSize="2xl">
          {!isSelectPlan ?
          scopedT('pricingCard.heading', {
            plan: <chakra.span color="orange.400">Starter</chakra.span>,
          }) :
          <chakra.span color="orange.400">Starter</chakra.span>}
        </Heading>
        <Text>{scopedT('pricingCard.starter.description')}</Text>
        <Heading>
          {formatPrice(price, currency)}
          <chakra.span fontSize="md">{scopedT('pricingCard.perMonth')}</chakra.span>
        </Heading>
        <FeaturesList
          features={[
            scopedT('pricingCard.starter.includedSeats'),
            <HStack key="test">
              <Text>
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronLeftIcon transform="rotate(-90deg)" />}
                    size="sm"
                    isLoading={selectedChatsLimitIndex === undefined}
                  >
                    {selectedChatsLimitIndex !== undefined
                      ? parseNumberWithCommas(
                          chatsLimit.STARTER.graduatedPrice[
                            selectedChatsLimitIndex
                          ].totalIncluded
                        )
                      : undefined}
                  </MenuButton>
                  <MenuList>
                    {chatsLimit.STARTER.graduatedPrice.map((price, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => setSelectedChatsLimitIndex(index)}
                      >
                        {parseNumberWithCommas(price.totalIncluded)}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>{' '}
                {scopedT('pricingCard.chatsPerMonth')}
              </Text>
              <MoreInfoTooltip>{scopedT('pricingCard.chatsTooltip')}</MoreInfoTooltip>
            </HStack>,
            scopedT('starter.brandingRemoved'),
            scopedT('starter.fileUploadBlock'),
            scopedT('starter.createFolders'),
          ]}
        />
      </Stack>
      <Stack>
        {isYearly && workspace.stripeId && !isCurrentPlan && (
          <Heading mt={highlights ? 2 : 0} fontSize="md">
            You pay: {formatPrice(price * 12, currency)} / year
          </Heading>
        )}
        <Button
          colorScheme="orange"
          variant="outline"
          onClick={handlePayClick}
          isLoading={isLoading}
          isDisabled={isCurrentPlan}
        >
          {getButtonLabel()}
        </Button>
      </Stack>
    </Stack>
  )
}
