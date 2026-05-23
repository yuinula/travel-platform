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
        month_caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm md:text-base font-bold text-zinc-900",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 md:h-10 md:w-10 bg-transparent p-0 opacity-70 hover:opacity-100 border-zinc-200 rounded-full absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 md:h-10 md:w-10 bg-transparent p-0 opacity-70 hover:opacity-100 border-zinc-200 rounded-full absolute right-1"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex mb-2",
        weekday: "text-zinc-400 rounded-md w-9 md:w-12 font-medium text-[0.75rem] md:text-[0.85rem] uppercase tracking-wider text-center",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center text-sm md:text-base focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 md:h-12 md:w-12 p-0 font-medium aria-selected:opacity-100 hover:bg-zinc-100 rounded-xl transition-all"
        ),
        range_start: "range-start bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/30",
        range_end: "range-end bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/30",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-zinc-100 text-zinc-900 font-bold border-2 border-primary/20",
        outside: "text-zinc-300 opacity-50 pointer-events-none",
        disabled: "text-zinc-200 opacity-50",
        range_middle: "aria-selected:bg-primary/10 aria-selected:text-primary font-bold !rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="h-5 w-5" />
          }
          return <ChevronRight className="h-5 w-5" />
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
