"use client"
import {
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Navbar as NextUINavbar,
} from "@nextui-org/navbar"
import { Avatar, Button, Image } from "@nextui-org/react"
import NextLink from "next/link"
import { BsSubstack } from "react-icons/bs"

export const Navbar = () => {
  return (
    <NextUINavbar
      maxWidth="2xl"
      className="bg-slate-950 text-white text-2xl"
      position="sticky"
    >
      <NavbarBrand>
        <NextLink
          className="flex justify-start mr-2 items-center gap-1"
          href="/"
        >
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
        <NavbarItem>
          <NextLink
            className="underline decoration-4 decoration-green-500 text-2xl underline-offset-4"
            color="white"
            href="/"
          >
            Demo
          </NextLink>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="mr-2">
          <div className="flex items-center">
            <span className="opacity-50">by&nbsp;</span>
            <NextLink
              href="https://www.linkedin.com/in/jordanahaines"
              target="_blank"
              className="border-b-4 border-transparent hover:border-blue-400 flex items-center px-1 mx-2"
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
        <NavbarItem>
          <NextLink
            className="bg-black text-white hover:text-green-500 text-xl"
            href="https://learnbuildteach.substack.com/p/building-historio-episode-0"
            target="_blank"
          >
            About
          </NextLink>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  )
}
