/**
 * This component renders Drawer and button to update timeline display settings.
 * Reads and writes to timeline context
 */

import { Button } from "@nextui-org/button"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
} from "@nextui-org/react"
import { MdOutlineDisplaySettings } from "react-icons/md"

export default function TimelineDisplaySettings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button
        onPress={onOpen}
        color="primary"
        endContent={<MdOutlineDisplaySettings />}
      >
        Timeline Display Settings
      </Button>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>Timeline Display Settings</DrawerHeader>
          <DrawerBody>
            <p>Settings coming soon! But look, this drawer works!</p>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
