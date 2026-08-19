# Getting Started

ts-vat is a TypeScript library for handling EU VAT calculations, validation, and MOSS compliance.

## Installation

::: code-group

```sh [npm]
npm install ts-vat
```

```sh [pnpm]
pnpm add ts-vat
```

```sh [bun]
bun add ts-vat
```

```sh [yarn]
yarn add ts-vat
```

:::

## Basic Usage

### Creating a Calculator

```typescript
import { VatCalculator } from 'ts-vat'

// Basic calculator
const calculator = new VatCalculator()

// With business country (for B2B reverse charge)
const calculator = new VatCalculator({
  businessCountryCode: 'DE',
})
```

### Configuration Options

```typescript
interface VatCalculatorConfig {
  // Your business country code
  businessCountryCode?: CountryCode

  // Custom VAT rules (optional)
  rules?: VatRules

  // Validation options
  validateVatNumbers?: boolean       // Default: true
  validatePostalCodes?: boolean      // Default: false
  validateCountryCodes?: boolean     // Default: true

  // Error handling
  forwardSoapFaults?: boolean        // Default: false
  soapTimeout?: number               // Default: 30000 (ms)
}
```

### Calculating VAT

```typescript
const calculator = new VatCalculator({
  businessCountryCode: 'DE',
})

// Simple calculation
const result = calculator.calculate(100, 'FR')
console.log(result)
// {
//   netPrice: 100,
//   grossPrice: 120,
//   vatAmount: 20,
//   vatRate: 0.20,
//   countryCode: 'FR',
//   isCompany: false,
// }

// With all parameters
const result = calculator.calculate(
  100,         // Net price
  'FR',        // Country code
  '75001',     // Postal code (optional)
  false,       // Is company (B2B)
  'high',      // Rate type (optional)
)
```

### Calculate from Gross Price

```typescript
// Calculate net from gross
const result = calculator.calculateNet(
  120,         // Gross price
  'FR',        // Country code
)

console.log(result)
// {
//   netPrice: 100,
//   grossPrice: 120,
//   vatAmount: 20,
//   vatRate: 0.20,
// }
```

## Country Codes

Supported EU country codes:

| Code | Country | Standard Rate |
|------|---------|---------------|
| AT | Austria | 20% |
| BE | Belgium | 21% |
| BG | Bulgaria | 20% |
| CY | Cyprus | 19% |
| CZ | Czech Republic | 21% |
| DE | Germany | 19% |
| DK | Denmark | 25% |
| EE | Estonia | 22% |
| EL/GR | Greece | 24% |
| ES | Spain | 21% |
| FI | Finland | 24% |
| FR | France | 20% |
| HR | Croatia | 25% |
| HU | Hungary | 27% |
| IE | Ireland | 23% |
| IT | Italy | 22% |
| LT | Lithuania | 21% |
| LU | Luxembourg | 17% |
| LV | Latvia | 21% |
| MT | Malta | 18% |
| NL | Netherlands | 21% |
| PL | Poland | 23% |
| PT | Portugal | 23% |
| RO | Romania | 19% |
| SE | Sweden | 25% |
| SI | Slovenia | 22% |
| SK | Slovakia | 20% |
| GB | United Kingdom | 20% |

## VAT Rate Types

Different VAT rate types are supported:

```typescript
type VatRateType =
  | 'high'           // Standard rate
  | 'low'            // Reduced rate
  | 'low1'           // Second reduced rate
  | 'super-reduced'  // Super-reduced rate
  | 'parking'        // Parking rate
```

### Using Rate Types

```typescript
// Standard rate (default)
const standard = calculator.calculate(100, 'FR')
// Rate: 20%

// Reduced rate (e.g., food, books)
const reduced = calculator.calculate(100, 'FR', null, false, 'low')
// Rate: 5.5%

// Second reduced rate (e.g., restaurants)
const reduced2 = calculator.calculate(100, 'FR', null, false, 'low1')
// Rate: 10%

// Super-reduced rate
const superReduced = calculator.calculate(100, 'FR', null, false, 'super-reduced')
// Rate: 2.1%
```

## Fluent API

Use method chaining for complex scenarios:

```typescript
const result = new VatCalculator()
  .setBusinessCountryCode('DE')
  .setCountryCode('FR')
  .setPostalCode('75001')
  .setCompany(false)
  .calculate(100)
```

## Checking VAT Collection

```typescript
const calculator = new VatCalculator({
  businessCountryCode: 'DE',
})

// Should you collect VAT?
const shouldCollect = calculator.shouldCollectVat('FR')
console.log(shouldCollect) // true

// B2B to same country
calculator.setCompany(true)
const shouldCollect = calculator.shouldCollectVat('DE')
console.log(shouldCollect) // true (domestic B2B)

// B2B to different EU country
calculator.setVatNumber('FR12345678901')
const shouldCollect = calculator.shouldCollectVat('FR')
console.log(shouldCollect) // false (reverse charge)
```

## Getting Tax Rates

```typescript
// Get rate for country
const rate = calculator.getTaxRateForCountry('DE')
console.log(rate) // 0.19

// Get rate with specific type
const reducedRate = calculator.getTaxRateForCountry('DE', false, 'low')
console.log(reducedRate) // 0.07

// Get rate for location (handles special territories)
const rate = calculator.getTaxRateForLocation('ES', '35001') // Canary Islands
console.log(rate) // 0 (no VAT in Canary Islands)
```

## TypeScript Types

```typescript
import type {
  CountryCode,
  VatRateType,
  VatRates,
  VatRules,
  VatCalculatorConfig,
  VatCalculationResult,
  VatNumberValidationResult,
} from 'ts-vat'
```

## Error Handling

```typescript
import {
  VatCalculator,
  InvalidCountryCodeException,
  InvalidPostalCodeException,
  InvalidVatNumberException,
  VatCheckUnavailableException,
} from 'ts-vat'

try {
  const calculator = new VatCalculator()
  calculator.setCountryCode('XX') // Invalid code
}
catch (error) {
  if (error instanceof InvalidCountryCodeException) {
    console.error('Invalid country code')
  }
}
```

## Next Steps

- [VAT Calculation](/guide/calculation) - Detailed calculation guide
- [MOSS Compliance](/guide/moss) - MOSS regulations
