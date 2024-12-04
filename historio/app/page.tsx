"use client"
import { Code } from "@nextui-org/code"
import { Snippet } from "@nextui-org/snippet"

import { subtitle, title } from "@/components/primitives"
import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div
        className={`inline-block max-w-xl text-center justify-center bg-amber-900	`}
      >
        <span className={title()}>Make&nbsp;</span>
        <span className={title({ color: "violet" })}>beautiful&nbsp;</span>
        <br />
        <span className={title()}>
          websites regardless of your design experience.
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          Beautiful, fast and modern React UI library.
        </div>
        <div>
          <Button></Button>
          <Dropdown>
            <DropdownTrigger>
              <Button type="button">Dropdown!</Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="test">Example Item</DropdownItem>
              <DropdownItem key="test">Example Item</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="flex gap-3">
        
      </div>

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Get started by editing <Code color="primary">app/page.tsx</Code>
          </span>
        </Snippet>
      </div>
    </section>
  )
}
