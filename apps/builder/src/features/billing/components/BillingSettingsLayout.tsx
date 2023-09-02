import { Stack, Heading } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Plan } from '@typebot.io/prisma'
import React from 'react'
import { InvoicesList } from './InvoicesList'
import { ChangePlanForm } from './ChangePlanForm'
import { UsageProgressBars } from './UsageProgressBars'
import { CurrentSubscriptionSummary } from './CurrentSubscriptionSummary'
import { SelectPlanForm } from './SelectPlanForm'
import { useScopedI18n } from '@/locales'

export const BillingSettingsLayout = () => {
  const scopedT = useScopedI18n('billing.plans')
  const { workspace } = useWorkspace()

  if (!workspace) return null
  return (
    <Stack spacing="10" w="full">
      {workspace.plan !== Plan.UNDEFINED && (
        <UsageProgressBars workspace={workspace} />
      )}
      <Stack spacing="4">
        {workspace.plan !== Plan.UNDEFINED && (
          <CurrentSubscriptionSummary workspace={workspace} />
        )}
        {workspace.plan !== Plan.UNDEFINED &&
          workspace.plan !== Plan.CUSTOM &&
          // workspace.plan !== Plan.LIFETIME &&
          workspace.plan !== Plan.UNLIMITED &&
          workspace.plan !== Plan.OFFERED && (
            <ChangePlanForm workspace={workspace} />
          )}
          {workspace.plan == Plan.UNDEFINED && (
            <>
              <Stack spacing="4">
                <Heading fontSize="3xl">{scopedT('heading')}</Heading>
              </Stack>
              <SelectPlanForm workspace={workspace} />
            </>
          )}
      </Stack>

      {workspace.stripeId && <InvoicesList workspaceId={workspace.id} />}
    </Stack>
  )
}
