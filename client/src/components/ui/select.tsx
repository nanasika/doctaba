import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
}

const Select = ({ children, onValueChange, defaultValue, value }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    onValueChange?.(newValue);
  };

  return (
    <SelectContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      selectedValue, 
      handleValueChange 
    }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedValue: string;
  handleValueChange: (value: string) => void;
} | null>(null);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = useSelectContext();
  
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { selectedValue } = useSelectContext();
  
  if (selectedValue) {
    const displayText = selectedValue === 'patient' ? 'Patient' : selectedValue === 'doctor' ? 'Doctor' : selectedValue;
    return <span className="text-gray-900">{displayText}</span>;
  }
  
  return <span className="text-gray-500">{placeholder}</span>;
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useSelectContext();
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-lg">
      {children}
    </div>
  );
};

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const { handleValueChange, selectedValue } = useSelectContext();
  
  return (
    <div 
      onClick={() => handleValueChange(value)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
        selectedValue === value ? 'bg-gray-100 font-medium' : ''
      }`}
    >
      {children}
    </div>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };