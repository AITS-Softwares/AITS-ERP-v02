"use client";

import DistributorSelect from "@/components/distributor/DistributorSelect";

export default function DistributorListFilters({ query, onQueryChange, placeholder = "Search", filterLabel, filterValue = "", onFilterChange, filterOptions = [] }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#105B92] focus:ring-2 focus:ring-blue-100"
      />
      {onFilterChange ? <div className="min-w-0 sm:w-64"><DistributorSelect value={filterValue} onChange={onFilterChange} aria-label={filterLabel || "Filter"} options={[{ value: "", label: filterLabel || "All records" }, ...filterOptions.map((option) => ({ value: option, label: option }))]} /></div> : null}
    </div>
  );
}
