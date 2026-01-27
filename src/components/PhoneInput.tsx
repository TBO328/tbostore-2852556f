import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { countryCodes, CountryCode } from '@/data/countryCodes';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string, fullNumber: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
}) => {
  const { language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find((c) => c.code === 'SA') || countryCodes[0]
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = countryCodes.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.nameAr.includes(search) ||
      country.dialCode.includes(search)
  );

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setOpen(false);
    setSearch('');
    onChange(value, `${country.dialCode}${value}`);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value.replace(/[^\d]/g, '');
    onChange(phoneNumber, `${selectedCountry.dialCode}${phoneNumber}`);
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[120px] justify-between px-3 font-normal"
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.dialCode}</span>
            </span>
            <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder={language === 'ar' ? 'ابحث عن الدولة...' : 'Search country...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                    selectedCountry.code === country.code && 'bg-accent'
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-start">
                    {language === 'ar' ? country.nameAr : country.name}
                  </span>
                  <span className="text-muted-foreground">{country.dialCode}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder || (language === 'ar' ? '5XXXXXXXX' : '5XXXXXXXX')}
        className="flex-1"
        disabled={disabled}
        dir="ltr"
      />
    </div>
  );
};

export default PhoneInput;
