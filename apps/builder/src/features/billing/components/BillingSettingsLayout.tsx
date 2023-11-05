import { Stack, Heading } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Plan } from '@typebot.io/prisma'
import React from 'react'
import { InvoicesList } from './InvoicesList'
import { ChangePlanForm } from './ChangePlanForm'
import { UsageProgressBars } from './UsageProgressBars'
import { CurrentSubscriptionSummary } from './CurrentSubscriptionSummary'
import { SelectPlanForm } from './SelectPlanForm'
import { useTranslate } from '@tolgee/react'

export const BillingSettingsLayout = () => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()

  if (!workspace) return null
  return (
    <Stack spacing="10" w="full">
      <UsageProgressBars workspace={workspace} />
      <Stack spacing="4">
        <CurrentSubscriptionSummary workspace={workspace} />
        {workspace.plan !== Plan.CUSTOM &&
          workspace.plan !== Plan.UNLIMITED &&
          workspace.plan !== Plan.OFFERED && (
            <ChangePlanForm excludedPlans={[Plan.STARTER]} workspace={workspace} />
          )}
        {workspace.plan == Plan.UNDEFINED && (
          <>
            <Stack spacing="4">
              <Heading fontSize="3xl">{t('billing.plans.heading')}</Heading>
            </Stack>
            <SelectPlanForm workspace={workspace} />
          </>
        )}
      </Stack>

      {workspace.stripeId && <InvoicesList workspaceId={workspace.id} />}
    </Stack>
  )
}
