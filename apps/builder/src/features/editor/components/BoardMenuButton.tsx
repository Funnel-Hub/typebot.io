import {
  Flex,
  FlexProps,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
} from '@chakra-ui/react'
import assert from 'assert'
import { BookIcon, DownloadIcon, MoreVerticalIcon } from '@/components/icons'
import { useTypebot } from '../providers/TypebotProvider'
import React, { useState } from 'react'
import { parseDefaultPublicId } from '@/features/publish/helpers/parseDefaultPublicId'
import { useTranslate } from '@tolgee/react'

export const BoardMenuButton = (props: FlexProps) => {
  const { typebot } = useTypebot()
  const [isDownloading, setIsDownloading] = useState(false)
  const { t } = useTranslate()

  const downloadFlow = () => {
    assert(typebot)
    setIsDownloading(true)
    const data =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(typebot))
    const fileName = `typebot-export-${parseDefaultPublicId(
      typebot.name,
      typebot.id
    )}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', data)
    linkElement.setAttribute('download', fileName)
    linkElement.click()
    setIsDownloading(false)
  }

  const redirectToDocumentation = () =>
    window.open('https://docs.typebot.io/get-started/overview', '_blank')

  return (
    <Flex
      bgColor={useColorModeValue('white', 'gray.900')}
      rounded="md"
      {...props}
    >
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<MoreVerticalIcon transform={'rotate(90deg)'} />}
          isLoading={isDownloading}
          size="sm"
          shadow="lg"
          bgColor={useColorModeValue('white', undefined)}
        />
        <MenuList>
          <MenuItem icon={<BookIcon />} onClick={redirectToDocumentation}>
            {t('editor.graph.menu.documentationItem.label')}
          </MenuItem>
          <MenuItem icon={<DownloadIcon />} onClick={downloadFlow}>
            {t('editor.graph.menu.exportFlowItem.label')}
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  )
}
