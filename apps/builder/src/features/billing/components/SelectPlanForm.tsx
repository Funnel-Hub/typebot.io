import { Stack, HStack } from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { Workspace } from '@typebot.io/schemas'
import { PreCheckoutModal, PreCheckoutModalProps } from './PreCheckoutModal'
import { useState } from 'react'
import { ParentModalProvider } from '@/features/graph/providers/ParentModalProvider'
import { useUser } from '@/features/account/hooks/useUser'
import { ProPlanPricingCard } from './ProPlanPricingCard'
import { useTranslate } from '@tolgee/react'

type Props = {
  workspace: Workspace
}

export const SelectPlanForm = ({ workspace }: Props) => {
  const { t } = useTranslate()

  const { user } = useUser()
  const { showToast } = useToast()
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutModalProps['selectedSubscription']>()

  const trpcContext = trpc.useContext()

  const { data, refetch } = trpc.billing.getSubscription.useQuery(
    {
      workspaceId: workspace.id,
    }
  )

  const { mutate: updateSubscription, isLoading: isUpdatingSubscription } =
    trpc.billing.updateSubscription.useMutation({
      onError: (error) => {
        showToast({
          description: error.message,
        })
      },
      onSuccess: ({ workspace, checkoutUrl }) => {
        if (checkoutUrl) {
          window.location.href = checkoutUrl
          return
        }
        refetch()
        trpcContext.workspace.getWorkspace.invalidate()
        showToast({
          status: 'success',
          description: t('updateSuccebilling.updateSuccessToast.description', {
            plan: workspace?.plan,
          }),
        })
      },
    })

  const handlePayClick = async (plan: 'STARTER' | 'PRO') => {

    const newSubscription = {
      plan,
      workspaceId: workspace.id,
      currency: 'brl',
    } as const
    if (workspace.stripeId) {
      updateSubscription({
        ...newSubscription,
        returnUrl: window.location.href,
      })
    } else {
      setPreCheckoutPlan(newSubscription)
    }
  }

  if (
    data?.subscription?.cancelDate ||
    data?.subscription?.status === 'past_due'
  )
    return null

  return (
    <Stack spacing={6}>
      {!workspace.stripeId && (
        <ParentModalProvider>
          <PreCheckoutModal
            selectedSubscription={preCheckoutPlan}
            existingEmail={user?.email ?? undefined}
            existingCompany={user?.company ?? undefined}
            onClose={() => setPreCheckoutPlan(undefined)}
          />
        </ParentModalProvider>
      )}
      {data && (
        <Stack align="flex-end" spacing={6}>
          <HStack alignItems="stretch" spacing="4" w="full">
            <ProPlanPricingCard
              currentPlan={workspace.plan}
              onPayClick={() => handlePayClick(Plan.PRO)}
              isLoading={isUpdatingSubscription}
              currency={'brl'}
            />
          </HStack>
        </Stack>
      )}
    </Stack>
  )
}
