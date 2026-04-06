export type PhoneCountryOption = {
  code: string;
  dialCode: string;
  flag: string;
  label: string;
  localLength: number;
  placeholder: string;
};

export const PHONE_COUNTRIES: PhoneCountryOption[] = [
  { code: "MX", dialCode: "+52", flag: "🇲🇽", label: "Mexico", localLength: 10, placeholder: "(000) 000-0000" },
  { code: "US", dialCode: "+1", flag: "🇺🇸", label: "Estados Unidos", localLength: 10, placeholder: "(000) 000-0000" },
  { code: "CA", dialCode: "+1", flag: "🇨🇦", label: "Canada", localLength: 10, placeholder: "(000) 000-0000" },
  { code: "AR", dialCode: "+54", flag: "🇦🇷", label: "Argentina", localLength: 10, placeholder: "000 000 0000" },
  { code: "BO", dialCode: "+591", flag: "🇧🇴", label: "Bolivia", localLength: 8, placeholder: "0000-0000" },
  { code: "BR", dialCode: "+55", flag: "🇧🇷", label: "Brasil", localLength: 11, placeholder: "00 00000-0000" },
  { code: "CL", dialCode: "+56", flag: "🇨🇱", label: "Chile", localLength: 9, placeholder: "000 000 000" },
  { code: "CO", dialCode: "+57", flag: "🇨🇴", label: "Colombia", localLength: 10, placeholder: "(000) 000-0000" },
  { code: "CR", dialCode: "+506", flag: "🇨🇷", label: "Costa Rica", localLength: 8, placeholder: "0000-0000" },
  { code: "EC", dialCode: "+593", flag: "🇪🇨", label: "Ecuador", localLength: 9, placeholder: "000 000 000" },
  { code: "SV", dialCode: "+503", flag: "🇸🇻", label: "El Salvador", localLength: 8, placeholder: "0000-0000" },
  { code: "GT", dialCode: "+502", flag: "🇬🇹", label: "Guatemala", localLength: 8, placeholder: "0000-0000" },
  { code: "HN", dialCode: "+504", flag: "🇭🇳", label: "Honduras", localLength: 8, placeholder: "0000-0000" },
  { code: "NI", dialCode: "+505", flag: "🇳🇮", label: "Nicaragua", localLength: 8, placeholder: "0000-0000" },
  { code: "PA", dialCode: "+507", flag: "🇵🇦", label: "Panama", localLength: 8, placeholder: "0000-0000" },
  { code: "PY", dialCode: "+595", flag: "🇵🇾", label: "Paraguay", localLength: 9, placeholder: "000 000 000" },
  { code: "PE", dialCode: "+51", flag: "🇵🇪", label: "Peru", localLength: 9, placeholder: "000 000 000" },
  { code: "DO", dialCode: "+1", flag: "🇩🇴", label: "Republica Dominicana", localLength: 10, placeholder: "(000) 000-0000" },
  { code: "UY", dialCode: "+598", flag: "🇺🇾", label: "Uruguay", localLength: 8, placeholder: "0000-0000" },
  { code: "VE", dialCode: "+58", flag: "🇻🇪", label: "Venezuela", localLength: 10, placeholder: "(000) 000-0000" },
];

export function getPhoneCountry(code: string) {
  return PHONE_COUNTRIES.find((country) => country.code === code) ?? PHONE_COUNTRIES[0];
}

export function normalizeLocalPhone(value: string, countryCode: string) {
  const country = getPhoneCountry(countryCode);
  return value.replace(/\D/g, "").slice(0, country.localLength);
}

export function formatLocalPhone(value: string, countryCode: string) {
  const country = getPhoneCountry(countryCode);
  const digits = normalizeLocalPhone(value, countryCode);

  if (country.localLength === 10) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (country.localLength === 8) {
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  if (country.localLength === 9) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  if (country.localLength === 11) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return digits;
}

export function toE164Phone(localValue: string, countryCode: string) {
  const country = getPhoneCountry(countryCode);
  const digits = normalizeLocalPhone(localValue, countryCode);
  return `${country.dialCode}${digits}`;
}

export function isValidLocalPhone(localValue: string, countryCode: string) {
  const country = getPhoneCountry(countryCode);
  return normalizeLocalPhone(localValue, countryCode).length === country.localLength;
}

export function isValidFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  return parts.every((part) => part.length >= 2);
}

export function isValidE164Phone(value: string) {
  return /^\+\d{8,15}$/.test(value.trim());
}
