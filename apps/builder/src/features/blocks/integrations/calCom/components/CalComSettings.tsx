import { DropdownList } from '@/components/DropdownList'
import { ChevronDownIcon } from '@/components/icons'
import { TextInput } from '@/components/inputs'
import { Select } from '@/components/inputs/Select'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CalComBlock } from '@typebot.io/schemas'
import {
  calComActions,
  calComLayout,
  defaultCalComOptions,
} from '@typebot.io/schemas/features/blocks/integrations/calCom/constants'
import React from 'react'

type Props = {
  options: CalComBlock['options']
  onOptionsChange: (options: CalComBlock['options']) => void
}

export const CalComSettings = ({ options, onOptionsChange }: Props) => {
  const updateAction = (action: (typeof calComActions)[number]) => {
    onOptionsChange({ ...options, action })
  }

  const action = options?.action

  return (
    <Stack spacing={4}>
      <DropdownList
        currentItem={action ?? defaultCalComOptions.action}
        onItemSelect={updateAction}
        items={calComActions}
      />
      {action === 'Book Event' && (
        <>
          <TextInput
            label="Base origin"
            defaultValue={
              options?.baseOrigin ?? defaultCalComOptions.baseOrigin
            }
            onChange={(baseOrigin: string) => {
              onOptionsChange({ ...options, baseOrigin })
            }}
          />
          <Flex as="fieldset" gap="2" direction="column">
            <Text as="label" fontWeight="medium">
              Event link
            </Text>
            <Select
              items={[]}
              placeholder="Choose an event"
              onSelect={(eventLink) =>
                onOptionsChange({ ...options, eventLink })
              }
            />
          </Flex>
          <Menu placement="bottom" matchWidth>
            <Flex as="fieldset" gap="2" alignItems="center" width="100%">
              <Text as="label" width="3.5rem" fontWeight="medium">
                Layout:
              </Text>
              <MenuButton
                as={Button}
                height="10"
                width="calc(100% - 3.5rem - 0.5rem)"
                flexShrink={0}
                textAlign="left"
                rightIcon={<ChevronDownIcon />}
              >
                {options?.layout || defaultCalComOptions.layout}
              </MenuButton>
              <MenuList minWidth={0}>
                <Stack overflowY="auto" spacing="0">
                  {calComLayout.map((layout, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        onOptionsChange({ ...options, layout })
                      }}
                    >
                      {layout}
                    </MenuItem>
                  ))}
                </Stack>
              </MenuList>
            </Flex>
          </Menu>

          <Accordion allowMultiple>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Prefill Information
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="4">
                <TextInput
                  label="Name"
                  placeholder="John Doe"
                  defaultValue={options?.user?.name}
                  onChange={(name: string) => {
                    onOptionsChange({
                      ...options,
                      user: { ...options?.user, name },
                    })
                  }}
                />
                <TextInput
                  label="Email"
                  placeholder="johndoe@gmail.com"
                  defaultValue={options?.user?.email}
                  onChange={(email: string) => {
                    onOptionsChange({
                      ...options,
                      user: { ...options?.user, email },
                    })
                  }}
                />
                <TextInput
                  label="Phone number"
                  placeholder="+919999999999"
                  defaultValue={options?.user?.phoneNumber}
                  onChange={(phoneNumber: string) => {
                    onOptionsChange({
                      ...options,
                      user: { ...options?.user, phoneNumber },
                    })
                  }}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <VariableSearchInput
            label="Save booked date"
            initialVariableId={undefined}
            onSelectVariable={() => {}}
          />
        </>
      )}
    </Stack>
  )
}
