import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Text } from "@chakra-ui/react";
import { Variable, WhatsappBlock } from "@typebot.io/schemas";


type Props = {
  options: WhatsappBlock['options']
  onOptionsChange: (options: WhatsappBlock['options']) => void
}
export function WhatsappSaveAnswer({ options, onOptionsChange }: Props) {


  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, answer: { variableId: variable?.id } })

  return (
    <Accordion>
      <AccordionItem>
        <AccordionButton>
          <Text w="full" textAlign="left">
            Save answer
          </Text>
        </AccordionButton>
        <AccordionPanel pt="4">
          <VariableSearchInput
            onSelectVariable={handleVariableChange}
            initialVariableId={options.answer?.variableId}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}