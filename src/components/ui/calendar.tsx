"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm md:text-base font-bold text-zinc-900",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 md:h-10 md:w-10 bg-transparent p-0 opacity-70 hover:opacity-100 border-zinc-200 rounded-full"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex mb-2",
        head_cell: "text-zinc-400 rounded-md w-9 md:w-12 font-medium text-[0.75rem] md:text-[0.85rem] uppercase tracking-wider",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm md:text-base focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary/10",
          props.mode === "range" 
            ? "[&:has(>.day-range-end)]:rounded-r-xl [&:has(>.day-range-start)]:rounded-l-xl first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl" 
            : "rounded-xl"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 md:h-12 md:w-12 p-0 font-medium aria-selected:opacity-100 hover:bg-zinc-100 rounded-xl transition-all"
        ),
        day_range_start: "day-range-start bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-xl shadow-lg shadow-primary/30",
        day_range_end: "day-range-end bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-xl shadow-lg shadow-primary/30",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-zinc-100 text-zinc-900 font-bold border-2 border-primary/20",
        day_outside: "text-zinc-300 opacity-50 pointer-events-none",
        day_disabled: "text-zinc-200 opacity-50",
        day_range_middle: "aria-selected:bg-primary/10 aria-selected:text-primary font-bold !rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
