import { cn, formatDateTime } from "@/lib/utils";


export default function FormatedDateTime({ date, className }: { date: string, className?: string }) {
  return (
    <p className={cn("body-1 text-light-200", className)}>
      {formatDateTime(date)}
    </p>
  )
}
