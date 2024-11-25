import { Separator } from "@/components/ui/separator"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background ">
      
        <Separator className="" />
        <div className="flex flex-col items-center justify-between gap-4 py-3 md:flex-row container max-w-7xl mx-auto text-xs">
          <p className=" text-muted-foreground">
            © 2024 FakeBillGenerator. All rights reserved.
          </p>
          <nav className="flex gap-4 ">
            <Link href="/about" className=" text-muted-foreground hover:underline">
              About
            </Link>
            <Link href="/terms" className=" text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className=" text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      
    </footer>
  )
}

