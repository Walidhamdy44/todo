"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select-primitives"

interface TimePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    disabled?: boolean
    className?: string
}

export function TimePicker({ date, setDate, disabled, className }: TimePickerProps) {
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString())
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"))
    const periods = ["AM", "PM"]

    const [selectedHour, setSelectedHour] = React.useState<string>("12")
    const [selectedMinute, setSelectedMinute] = React.useState<string>("00")
    const [selectedPeriod, setSelectedPeriod] = React.useState<string>("AM")

    React.useEffect(() => {
        if (date) {
            let h = date.getHours()
            const m = date.getMinutes()
            const p = h >= 12 ? "PM" : "AM"

            if (h === 0) h = 12
            else if (h > 12) h -= 12

            setSelectedHour(h.toString())
            setSelectedMinute(m.toString().padStart(2, "0")) // simplified to nearest 5 or keep exact?
            // If exact minute is not in list, Select might look empty. 
            // I'll stick to exact minute for display if possible, or snap to nearest 5? 
            // For now, I'll generate 60 minutes option or just 00, 15, 30, 45?
            // Array(60) is fine for dropdown.
            setSelectedPeriod(p)
        }
    }, [date])

    const updateTime = (type: "hour" | "minute" | "period", value: string) => {
        if (!date && !disabled) {
            // If no date selected, we can't really set time unless we default to today?
            // But usually TimePicker pairs with DatePicker.
            return
        }
        if (!date) return

        const newDate = new Date(date)

        if (type === "hour") {
            let h = parseInt(value)
            if (selectedPeriod === "PM" && h !== 12) h += 12
            if (selectedPeriod === "AM" && h === 12) h = 0
            newDate.setHours(h)
        } else if (type === "minute") {
            newDate.setMinutes(parseInt(value))
        } else if (type === "period") {
            let h = newDate.getHours()
            if (value === "PM" && h < 12) h += 12
            if (value === "AM" && h >= 12) h -= 12
            newDate.setHours(h)
        }

        setDate(newDate)
    }

    // Generate 60 minutes for better precision
    const allMinutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-1 border rounded-md p-1 bg-white dark:bg-zinc-800/50">
                <Clock className="w-4 h-4 text-muted-foreground ml-2 mr-1" />

                <Select
                    value={selectedHour}
                    onValueChange={(v) => updateTime("hour", v)}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-[65px] h-8 border-0 focus:ring-0 px-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="h-48">
                        {hours.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <span className="text-muted-foreground">:</span>

                <Select
                    value={selectedMinute}
                    onValueChange={(v) => updateTime("minute", v)}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-[65px] h-8 border-0 focus:ring-0 px-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="h-48">
                        {allMinutes.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={selectedPeriod}
                    onValueChange={(v) => updateTime("period", v)}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-[65px] h-8 border-0 focus:ring-0 px-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground">
                        <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
