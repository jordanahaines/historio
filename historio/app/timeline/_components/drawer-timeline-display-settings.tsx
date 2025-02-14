/**
 * This component renders Drawer and button to update timeline display settings.
 * Reads and writes to timeline context
 * //TODO: I don't think this is within context, so will need to fix that
 */

import { Button } from "@nextui-org/button"
import {
  Checkbox,
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
  TimelineContextSettings,
  TimelineDispatchActionType,
  useTimelineContext,
} from "../context-timeline"

export default function TimelineDisplaySettings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { timelineContext, updateTimelineContext } = useTimelineContext()

  const bookIDS = timelineContext.books.map((b) => b.bookID).toString()
  const updateColor = useCallback(
    (color: string, bookID: string) => {
      const bookContext = _.find(
        timelineContext.books,
        (b) => b.bookID === bookID,
      )
      if (!bookContext || !updateTimelineContext) return
      updateTimelineContext({
        type: TimelineDispatchActionType.updateBook,
        payload: { ...bookContext, currentColor: color },
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateTimelineContext, bookIDS],
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
  type TailwindTimelineColors = keyof typeof tailwindTimelineColors

  const renderColorMenuItem = (color: keyof typeof tailwindTimelineColors) => {
    return (
      <DropdownItem key={color}>
        <div className="flex items-center justify-start">
          <div
            className={`${tailwindTimelineColors[color]} mr-4 size-2 rounded-full`}
          />
          <span>{_.capitalize(color)}</span>
        </div>
      </DropdownItem>
    )
  }
  const renderBookSelect = (book: TimelineContextBook) => {
    const keys: TailwindTimelineColors[] = Object.keys(
      tailwindTimelineColors,
    ) as TailwindTimelineColors[]
    return (
      <div className="flex items-center justify-between border-b-1 border-slate-100 py-2 last:border-b-0">
        <p className="pr-4">{book.bookTitle}</p>
        <Dropdown className="grow">
          <DropdownTrigger>
            <Button
              isIconOnly
              className={`${tailwindTimelineColors[book.currentColor as TailwindTimelineColors]} text-white`}
            >
              <IoColorPaletteOutline size={30} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Timeline Colors"
            onAction={(k) => updateColor(k.toString(), book.bookID)}
          >
            {keys.map((k) => renderColorMenuItem(k))}
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }

  const handleChangeSettings = useCallback(
    (value: Partial<TimelineContextSettings>) => {
      if (!updateTimelineContext) return
      updateTimelineContext({
        type: TimelineDispatchActionType.updateSettings,
        payload: value,
      })
    },
    [updateTimelineContext],
  )

  const renderBarsMode = () => {
    if (!timelineContext.settings.showOverlapBars) return
    return (
      <div className="py-4">
        <p>
          Your timelines include overlap bars. What time period should those
          bars represent?
        </p>
        <RadioGroup
          color="primary"
          className="py-2"
          value={timelineContext.settings.barsMode}
          onChange={(e) =>
            handleChangeSettings({
              barsMode: e.target.value as TimelineBarsMode,
            })
          }
        >
          <Radio
            description="Overlap bars represent the full duration of other timelines. As you scroll, bars remain static."
            value={TimelineBarsMode.fullBook}
          >
            Full Time Period of Book
          </Radio>
          <Radio
            description="Overlap bars represent the current view of other timelines. As you scroll, bars move."
            value={TimelineBarsMode.currentView}
          >
            Current Timespan from Book&apos; Timeline
          </Radio>
        </RadioGroup>
      </div>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        className="text-white hover:bg-white"
        endContent={<MdOutlineDisplaySettings />}
        onPress={onOpen}
        size="sm"
      >
        Timeline Display Settings
      </Button>
      <Drawer size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>Timeline Display Settings</DrawerHeader>
          <DrawerBody>
            <div className="pt-4">
              <h3 className="text-center font-serif font-bold">Book Colors</h3>
              <p className="help text-center">
                Adjust the color for each book on the timeline
              </p>
              {timelineContext.books.map((b) => renderBookSelect(b))}
            </div>
            <div className="mt-2 border-t-3 border-t-zinc-500 pt-4">
              <h3 className="text-center font-serif font-bold">Book Overlap</h3>
              <p className="text-center">
                There are two ways Historio can visualize how books overlap with
                each other:
                <br />
                <ul className="mt-2">
                  <li>
                    <b>Dots</b>&nbsp; that represent events from <i>other</i>{" "}
                    books on each timeline.
                  </li>

                  <li>
                    <b>Bars</b>&nbsp; that represent the time span of{" "}
                    <i>other</i> books on each timeline.
                  </li>
                </ul>
              </p>
              <h4 className="mt-7 text-center font-serif text-sm font-bold">
                Configure Book Overlap Settings:
              </h4>
              <div className="py-1">
                <Checkbox
                  onValueChange={(e) =>
                    handleChangeSettings({ showOverlapDots: e })
                  }
                  isSelected={timelineContext.settings.showOverlapDots}
                >
                  Show dots representing <i>other</i> books&apos; events on each
                  timeline
                </Checkbox>
              </div>
              <div className="py-1">
                <Checkbox
                  onValueChange={(e) =>
                    handleChangeSettings({ showOverlapBars: e })
                  }
                  isSelected={timelineContext.settings.showOverlapBars}
                >
                  Show bars representing time period of <i>other</i> books on
                  each timeline
                </Checkbox>
              </div>
              {renderBarsMode()}
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
