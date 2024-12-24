"use client"
import { Input } from "@nextui-org/input"
import { Kbd } from "@nextui-org/kbd"
import { BsSubstack } from "react-icons/bs"
import {
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Navbar as NextUINavbar,
} from "@nextui-org/navbar"
import { Avatar, Button, Image } from "@nextui-org/react"
import NextLink from "next/link"

import { SearchIcon } from "@/components/icons"

export const Navbar = () => {
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}></Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  )

  return (
    <NextUINavbar
      maxWidth="2xl"
      className="bg-black text-white text-2xl"
      position="sticky"
    >
      <NavbarBrand>
        <NextLink className="flex justify-start items-center gap-1" href="/">
          <Image
            width={65}
            src="/img/logo/logo_transparent.png"
            alt="Historio"
            isZoomed
          />
          <h1 className="font-bold ml-3 text-3xl font-serif">Historio</h1>
        </NextLink>
      </NavbarBrand>
      <NavbarContent justify="center">
        <img
          className="opacity-30 mr-6"
          width={60}
          src="/img/elements/colliseum.png"
          alt="Colliseum"
        />
        <NavbarItem>
          <NextLink
            className="underline decoration-4 decoration-green-500 text-2xl underline-offset-4"
            color="white"
            href="/"
          >
            Demo
          </NextLink>
        </NavbarItem>
        <img
          className="opacity-35 ml-4"
          width={60}
          src="/img/elements/midway.png"
          alt="Battle of Midway"
        />
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            className="bg-black text-orange-400"
            href="https://learnbuildteach.substack.com/p/building-historio-episode-0"
          >
            <BsSubstack />
            &nbsp;About
          </Button>
        </NavbarItem>
        <NavbarItem className="ml-8">
          <div className="flex items-center">
            <span className="opacity-50">by&nbsp;</span>
            <NextLink
              href="https://www.linkedin.com/in/jordanahaines"
              target="_blank"
              className="hover:border-b-4 border-blue-400 hover:scale-125 flex items-center px-2 mx-2"
            >
              <Avatar
                size="sm"
                src="https://cdn.bsky.app/img/avatar/plain/did:plc:mkbncjxrakp5drcyfx3o2ehc/bafkreicx3dcb42mw4b2rqck6rvmvp5fxrwkmx3nwsespiut6g27onbtwbe@jpeg"
              />
              &nbsp;Jordan
            </NextLink>
            <span className="opacity-50">in MPLS</span>
          </div>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  )
}
