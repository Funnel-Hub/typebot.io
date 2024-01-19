import { FunnelHubSidebar } from '@/components/FunnelHubSidebar'
import { DashboardPage } from '@/features/dashboard/components/DashboardPage'
import { useDisclosure } from '@chakra-ui/react'
import { GetServerSidePropsContext } from 'next'

export default function Page() {
  const { onClose } = useDisclosure()
	
  return (
  	<>
	  <FunnelHubSidebar onClose={onClose} />
	  <DashboardPage />
	</>
  )
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const redirectPath = context.query.redirectPath?.toString()
  return redirectPath
    ? {
        redirect: {
          permanent: false,
          destination: redirectPath,
        },
      }
    : { props: {} }
}
