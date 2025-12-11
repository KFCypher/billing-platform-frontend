'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format: string; // e.g., "XXX XXX XXXX"
}

const COUNTRIES: Country[] = [
  { code: 'GH', name: 'Ghana', dialCode: '233', flag: '🇬🇭', format: 'XXX XXX XXXX' },
  { code: 'UG', name: 'Uganda', dialCode: '256', flag: '🇺🇬', format: 'XXX XXX XXX' },
  { code: 'NG', name: 'Nigeria', dialCode: '234', flag: '🇳🇬', format: 'XXX XXXX XXXX' },
  { code: 'ZA', name: 'South Africa', dialCode: '27', flag: '🇿🇦', format: 'XX XXX XXXX' },
  { code: 'KE', name: 'Kenya', dialCode: '254', flag: '🇰🇪', format: 'XXX XXXXXX' },
  { code: 'TZ', name: 'Tanzania', dialCode: '255', flag: '🇹🇿', format: 'XXX XXX XXX' },
  { code: 'RW', name: 'Rwanda', dialCode: '250', flag: '🇷🇼', format: 'XXX XXX XXX' },
  { code: 'CI', name: 'Ivory Coast', dialCode: '225', flag: '🇨🇮', format: 'XX XX XX XX XX' },
];

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  countryCode?: string;
  onCountryChange?: (code: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  countryCode = 'GH',
  onCountryChange,
  error,
  label = 'Phone Number',
  placeholder,
  required = false,
}: PhoneInputProps) {
  const [localPhone, setLocalPhone] = useState(value);
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0]
  );

  useEffect(() => {
    setLocalPhone(value);
  }, [value]);

  useEffect(() => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
    }
  }, [countryCode]);

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code);
    if (country) {
      setSelectedCountry(country);
      onCountryChange?.(code);
      // Clear phone number when country changes
      setLocalPhone('');
      onChange('');
    }
  };

  const formatPhoneNumber = (input: string, format: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Apply format
    let formatted = '';
    let digitIndex = 0;
    
    for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
      if (format[i] === 'X') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input, selectedCountry.format);
    setLocalPhone(formatted);
    
    // Return only digits with country code
    const digitsOnly = formatted.replace(/\D/g, '');
    const fullNumber = `${selectedCountry.dialCode}${digitsOnly}`;
    onChange(fullNumber);
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return selectedCountry.format.replace(/X/g, '0');
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="phone-input">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="flex gap-2">
        <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{selectedCountry.flag}</span>
                <span>+{selectedCountry.dialCode}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-gray-500">+{country.dialCode}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1 relative">
          <Input
            id="phone-input"
            type="tel"
            value={localPhone}
            onChange={handlePhoneChange}
            placeholder={getPlaceholder()}
            className={error ? 'border-red-500' : ''}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      
      <p className="text-xs text-gray-500">
        Format: +{selectedCountry.dialCode} {selectedCountry.format}
      </p>
    </div>
  );
}

export { COUNTRIES };
export type { Country };
