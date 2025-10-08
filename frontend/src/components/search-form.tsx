// Modified search-form.tsx
// Changes:
// - Added onSubmit and value/onChange props to make it controlled
// - Integrated with search state from parent (AppSidebar)
// - Form now submits search query (can be extended to navigate or filter)

import { Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"

interface SearchFormProps extends React.ComponentProps<"form"> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: (query: string) => void
}

export function SearchForm({ value, onChange, onSubmit, ...props }: SearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit && value.trim()) {
      onSubmit(value)
    }
  }

  return (
    <form onSubmit={handleSubmit} {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search the docs..."
            className="pl-8"
            value={value}
            onChange={onChange}
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}