"use client"
import {
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Navbar as NextUINavbar,
} from "@nextui-org/navbar"
import { Avatar, Image } from "@nextui-org/react"
import NextLink from "next/link"

export const Navbar = () => {
  return (
    <NextUINavbar
      className="bg-slate-950 text-2xl text-white"
      maxWidth="2xl"
      position="sticky"
    >
      <NavbarBrand>
        <NextLink
          className="mr-2 flex items-center justify-start gap-1"
          href="/"
        >
          <Image
            isZoomed
            alt="Historio"
            src="/img/logo/logo_transparent.png"
            width={65}
          />
          <h1 className="ml-3 font-serif text-3xl font-bold">Historio</h1>
        </NextLink>
      </NavbarBrand>
      <NavbarContent justify="center">
        <NavbarItem>
          <NextLink
            className="text-2xl underline decoration-green-500 decoration-4 underline-offset-4"
            color="white"
            href="/library/demo-timelines"
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
              className="mx-2 flex items-center border-b-4 border-transparent px-1 hover:border-blue-400"
              href="https://www.linkedin.com/in/jordanahaines"
              target="_blank"
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
            className="bg-black text-xl text-white hover:text-green-500"
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
