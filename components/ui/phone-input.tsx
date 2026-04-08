"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, value, ...props }, ref) => {
  return (
    <RPNInput.default
      ref={ref}
      className={cn("flex w-full gap-3", className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      international={false}
      value={value || undefined}
      onChange={(nextValue) => onChange?.(nextValue || ("" as RPNInput.Value))}
      {...props}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <Input
    className={cn(
      "h-12 min-w-0 flex-1 rounded-[14px] border border-[#e8decf] bg-[#fcfaf6] px-4 text-sm text-slate-900",
      className,
    )}
    {...props}
    ref={ref}
  />
));
InputComponent.displayName = "PhoneInputInput";

type CountryOption = {
  label: string;
  value: RPNInput.Country | undefined;
};

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryOption[];
  onChange: (country: RPNInput.Country) => void;
};

function CountrySelect({
  disabled,
  value: selectedCountry,
  options,
  onChange,
}: CountrySelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-12 min-w-[128px] justify-between rounded-[14px] border border-[#e8decf] bg-[#fcfaf6] px-3 text-sm text-slate-900"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <FlagComponent country={selectedCountry} countryName={selectedCountry} />
            <span>{`+${RPNInput.getCountryCallingCode(selectedCountry)}`}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 w-[300px] overflow-y-auto">
        {options.map(({ value, label }) =>
          value ? (
            <DropdownMenuItem
              key={value}
              onClick={() => onChange(value)}
              className="flex items-center gap-2"
            >
              <FlagComponent country={value} countryName={label} />
              <span className="flex-1 text-sm">{label}</span>
              <span className="text-xs text-slate-500">{`+${RPNInput.getCountryCallingCode(value)}`}</span>
              <Check className={cn("h-4 w-4", value === selectedCountry ? "opacity-100" : "opacity-0")} />
            </DropdownMenuItem>
          ) : null,
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:h-full [&_svg]:w-full">
      {Flag ? <Flag title={countryName} /> : null}
    </span>
  );
};

export { PhoneInput };
