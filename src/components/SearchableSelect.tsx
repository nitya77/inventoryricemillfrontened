"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface Option {
  id: string | number;
  label: string;
  subLabel?: string;
}

interface AutocompleteSelectProps {
  options: Option[];
  value: string | number;
  onChange?: (id: string | number) => void;
  placeholder?: string;
  label?: string;
  icon?: any;
  className?: string;
}

interface DropdownPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  openUpwards: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search and Select...",
  label,
  icon: Icon,
  className = "",
}: AutocompleteSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    openUpwards: false,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.id === value),
    [options, value]
  );

  // Sync internal input value with selected option
  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else {
      setInputValue("");
    }
  }, [selectedOption]);

  // Compute fixed-position coordinates from input element
  const computePosition = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < 320;

    setDropdownPos({
      left: rect.left,
      width: rect.width,
      openUpwards,
      top: openUpwards ? undefined : rect.bottom + 6,
      bottom: openUpwards ? window.innerHeight - rect.top + 6 : undefined,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    computePosition();

    const handleScrollOrResize = () => computePosition();
    // Listen on all scrollable ancestors
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check wrapper AND the portal dropdown
      const portalEl = document.getElementById("searchable-select-portal-active");
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        !(portalEl && portalEl.contains(target))
      ) {
        setIsOpen(false);
        if (selectedOption) setInputValue(selectedOption.label);
        else setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, selectedOption]);

  const filteredOptions = useMemo(() => {
    if (
      !inputValue ||
      (selectedOption &&
        inputValue === (selectedOption?.label || "") &&
        !isOpen)
    ) {
      return options;
    }
    const search = inputValue.toLowerCase();
    return options.filter(
      (opt) =>
        (opt?.label || "").toLowerCase().includes(search) ||
        (opt?.subLabel && opt.subLabel.toLowerCase().includes(search))
    );
  }, [options, inputValue, isOpen, selectedOption]);

  const handleSelect = (opt: Option) => {
    if (onChange) onChange(opt.id);
    setInputValue(opt.label);
    setIsOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) onChange("");
    setInputValue("");
    setIsOpen(false);
  };

  const dropdownContent = isOpen && mounted ? (
    <div
      id="searchable-select-portal-active"
      style={{
        position: "fixed",
        left: dropdownPos.left,
        width: dropdownPos.width,
        top: dropdownPos.openUpwards ? undefined : dropdownPos.top,
        bottom: dropdownPos.openUpwards ? dropdownPos.bottom : undefined,
        zIndex: 9999,
        minWidth: 280,
      }}
      className={`bg-white border border-slate-200 shadow-2xl overflow-hidden transition-all duration-200 ${
        dropdownPos.openUpwards
          ? "rounded-t-[2rem] rounded-b-lg"
          : "rounded-b-[2rem] rounded-t-lg"
      }`}
    >
      <div className="max-h-64 overflow-y-auto custom-scrollbar py-2">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt, idx) => (
            <div
              key={`${opt.id}-${idx}`}
              onMouseDown={(e) => {
                // Use mousedown so it fires before the outside-click handler
                e.preventDefault();
                handleSelect(opt);
              }}
              className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 relative ${
                value === opt.id ? "bg-indigo-50/50" : ""
              }`}
            >
              <div className="flex flex-col">
                <span
                  className={`text-xs font-black uppercase tracking-tight ${
                    value === opt.id ? "text-indigo-600" : "text-slate-700"
                  }`}
                >
                  {opt.label}
                </span>
                {opt.subLabel && (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-70">
                    {opt.subLabel}
                  </span>
                )}
              </div>
              {value === opt.id && <Check size={16} className="text-indigo-600" />}
            </div>
          ))
        ) : (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <Search size={24} className="text-slate-100" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              No matching results
            </p>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div
      className={`space-y-2.5 relative w-full ${className}`}
      ref={wrapperRef}
    >
      {label && (
        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1 block">
          {label}
        </label>
      )}

      <div className="relative group">
        {Icon && (
          <Icon
            size={18}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${
              isOpen ? "text-indigo-600" : "text-slate-400"
            }`}
          />
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-white border rounded-2xl pl-12 pr-12 py-4 text-sm font-black outline-none transition-all shadow-sm ${
            isOpen
              ? "border-indigo-600 ring-4 ring-indigo-600/5"
              : "border-slate-200 hover:border-slate-300"
          } ${
            selectedOption
              ? "text-slate-900"
              : "text-slate-400 placeholder:text-slate-300"
          }`}
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-300 hover:text-slate-500 transition-all"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={`text-slate-300 transition-transform duration-300 ${
              isOpen ? "rotate-180 text-indigo-600" : ""
            }`}
          />
        </div>
      </div>

      {mounted && createPortal(dropdownContent, document.body)}
    </div>
  );
}
