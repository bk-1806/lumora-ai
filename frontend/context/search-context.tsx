"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface SearchContextType {
    searchQuery: string
    setSearchQuery: (q: string) => void
    highlight: (text: string) => string
    matches: (text: string) => boolean
}

const SearchContext = createContext<SearchContextType>({
    searchQuery: "",
    setSearchQuery: () => { },
    highlight: (t) => t,
    matches: () => true,
})

export function SearchProvider({ children }: { children: ReactNode }) {
    const [searchQuery, setSearchQuery] = useState("")

    const matches = (text: string) =>
        !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase())

    const highlight = (text: string) => text // raw text; components handle markup

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, highlight, matches }}>
            {children}
        </SearchContext.Provider>
    )
}

export const useSearch = () => useContext(SearchContext)
