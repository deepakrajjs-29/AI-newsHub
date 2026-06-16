"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface NewsSearchFiltersProps {
  categories: CategoryOption[];
  currentQuery: string;
  currentCategory: string;
  currentSort: string;
}

export default function NewsSearchFilters({
  categories,
  currentQuery,
  currentCategory,
  currentSort,
}: NewsSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentQuery);

  const updateFilters = (updates: { query?: string; category?: string; sort?: string; page?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page on filter changes
    params.delete("page");

    if (updates.query !== undefined) {
      if (updates.query) params.set("query", updates.query);
      else params.delete("query");
    }
    
    if (updates.category !== undefined) {
      if (updates.category) params.set("category", updates.category);
      else params.delete("category");
    }
    
    if (updates.sort !== undefined) {
      if (updates.sort) params.set("sort", updates.sort);
      else params.delete("sort");
    }

    startTransition(() => {
      router.push(`/news?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: search });
  };

  return (
    <div className="space-y-6">
      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          placeholder="Search articles, keywords, or topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-12 py-3 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all duration-200 shadow-sm"
        />
        <Search className="absolute left-3.5 h-4.5 w-4.5 text-muted-foreground" />
        <button
          type="submit"
          disabled={isPending}
          className="absolute right-2.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center min-w-[50px]"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
        </button>
      </form>

      {/* Category Pills & Sort Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        {/* Categories list */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => updateFilters({ category: "" })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              !currentCategory
                ? "bg-foreground text-background border-foreground font-semibold"
                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilters({ category: cat.slug })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                currentCategory === cat.slug
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort drop down */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
