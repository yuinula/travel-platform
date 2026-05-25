"use client"

import { usePathname } from "next/navigation"
import Navbar from "./navbar"

export default function HeaderShell() {
  const pathname = usePathname()
  
  // Hide main Navbar for all backoffice routes
  if (pathname.startsWith('/backoffice')) {
    return null
  }

  return <Navbar />
}
