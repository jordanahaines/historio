/**
 * This component renders Drawer and button to update timeline display settings.
 * Reads and writes to timeline context
 * //TODO: I don't think this is within context, so will need to fix that
 */

import { Button } from "@nextui-org/button"
import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Radio,
  RadioGroup,
  useDisclosure,
} from "@nextui-org/react"
import _ from "lodash"
import { useCallback } from "react"
import { IoColorPaletteOutline } from "react-icons/io5"
import { MdOutlineDisplaySettings } from "react-icons/md"
import {
  TimelineBarsMode,
  TimelineContextBook,
  TimelineDispatchActionType,
  useTimelineContext,
} from "../context-timeline"

export default function TimelineDisplaySettings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { timelineContext, updateTimelineContext } = useTimelineContext()
  if (!updateTimelineContext) return

  const updateColor = useCallback(
    (color: string, bookID: string) => {
      const bookContext = _.find(
        timelineContext.books,
        (b) => b.bookID === bookID,
      )
      if (!bookContext) return
      updateTimelineContext({
        type: TimelineDispatchActionType.updateBook,
        payload: { ...bookContext, currentColor: color },
      })
    },
    [updateTimelineContext],
  )

  // These have to be defined here to be picked up by tailwind
  const tailwindTimelineColors = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    lime: "bg-lime-500",
    sky: "bg-sky-500",
    fuchsia: "bg-fuchsia-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
    teal: "bg-teal-500",
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500",
    yellow: "bg-yellow-500",
    violet: "bg-violet-500",
  }
  const renderColorMenuItem = (color: keyof typeof tailwindTimelineColors) => {
    return (
      <DropdownItem key={color}>
        <div className="flex justify-start items-center">
          <div
            className={`${tailwindTimelineColors[color]} rounded-full w-2 h-2 mr-4`}
          ></div>
          <span>{_.capitalize(color)}</span>
        </div>
      </DropdownItem>
    )
  }
  const renderBookSelect = (book: TimelineContextBook) => {
    return (
      <div className="py-2 flex justify-between items-center border-b-1 border-slate-100 last:border-b-0">
        <p className="pr-4">{book.bookTitle}</p>
        <Dropdown className="grow">
          <DropdownTrigger>
            <Button
              className={`${tailwindTimelineColors[book.currentColor]} text-white`}
              isIconOnly
            >
              <IoColorPaletteOutline size={30} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            onAction={(k) => updateColor(k.toString(), book.bookID)}
            aria-label="Timeline Colors"
          >
            {
              // @ts-ignore
              Object.keys(tailwindTimelineColors).map(renderColorMenuItem)
            }
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }

  const handleChangeBarMode = useCallback(
    (val: TimelineBarsMode) => {
      updateTimelineContext({
        type: TimelineDispatchActionType.updateSettings,
        payload: { barsMode: val },
      })
    },
    [updateTimelineContext],
  )

  const renderBarsMode = () => {
    return (
      <div className="py-4">
        <RadioGroup
          color="primary"
          label="Overlap Bars Mode"
          value={timelineContext.settings.barsMode}
          onChange={(e) =>
            handleChangeBarMode(e.target.value as TimelineBarsMode)
          }
        >
          <Radio
            value={TimelineBarsMode.fullBook}
            description="Overlap bars represent the full duration of other timelines"
          >
            Full Timeline
          </Radio>
          <Radio
            value={TimelineBarsMode.currentView}
            description="Overlap bars represent the current view of other timelines"
          >
            Current View Only
          </Radio>
          <Radio
            value={TimelineBarsMode.hidden}
            description="Hide overlap bars"
          >
            Hide Bars
          </Radio>
        </RadioGroup>
      </div>
    )
  }

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
            <div className="pt-4">
              <h3 className="font-serif font-bold text-center">Book Colors</h3>
              <p className="help text-center">
                Adjust the color for each book on the timeline
              </p>
              {timelineContext.books.map(renderBookSelect)}
            </div>
            <div className="pt-4 mt-2 border-t-3 border-t-zinc-500">
              <h3 className="font-serif font-bold text-center">Overlap Bars</h3>
              <p className="help text-center">
                The background of each timeline has colored bars to visualize
                overlap with other timelines. Hover over one of these bars to
                highlight the associated timeline
              </p>
              {renderBarsMode()}
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
