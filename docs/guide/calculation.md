# VAT Calculation

Detailed guide on calculating VAT with ts-vat.

## Basic Calculation

### Net to Gross

Calculate gross price from net price:

```typescript
import { VatCalculator } from 'ts-vat'

const calculator = new VatCalculator()

const result = calculator.calculate(100, 'DE')

console.log(result)
// {
//   netPrice: 100,
//   grossPrice: 119,
//   vatAmount: 19,
//   vatRate: 0.19,
//   countryCode: 'DE',
//   isCompany: false,
//   details: {
//     ruleApplied: 'standard',
//     reverseCharge: false,
//   },
// }
```

### Gross to Net

Calculate net price from gross price:

```typescript
const result = calculator.calculateNet(119, 'DE')

console.log(result)
// {
//   netPrice: 100,
//   grossPrice: 119,
//   vatAmount: 19,
//   vatRate: 0.19,
// }
```

## VAT Rate Types

Different product categories have different VAT rates:

### Standard Rate (High)

Default rate for most goods and services:

```typescript
const result = calculator.calculate(100, 'FR')
// Rate: 20%
// Gross: 120
```

### Reduced Rates

Lower rates for specific categories like food, books, medicine:

```typescript
// First reduced rate
const reduced = calculator.calculate(100, 'FR', null, false, 'low')
// Rate: 5.5% (France reduced rate)
// Gross: 105.50

// Second reduced rate
const reduced2 = calculator.calculate(100, 'FR', null, false, 'low1')
// Rate: 10% (France second reduced rate)
// Gross: 110
```

### Super-Reduced Rate

Very low rates for essential goods:

```typescript
const superReduced = calculator.calculate(100, 'FR', null, false, 'super-reduced')
// Rate: 2.1% (France super-reduced rate)
// Gross: 102.10
```

### Parking Rate

Transitional rates in some countries:

```typescript
const parking = calculator.calculate(100, 'IE', null, false, 'parking')
// Rate: 13.5% (Ireland parking rate)
// Gross: 113.50
```

## Country-Specific Rates

### Germany (DE)

```typescript
// Standard: 19%
calculator.calculate(100, 'DE')
// Gross: 119

// Reduced: 7%
calculator.calculate(100, 'DE', null, false, 'low')
// Gross: 107
```

### France (FR)

```typescript
// Standard: 20%
calculator.calculate(100, 'FR')
// Gross: 120

// Reduced: 5.5%
calculator.calculate(100, 'FR', null, false, 'low')
// Gross: 105.50

// Intermediate: 10%
calculator.calculate(100, 'FR', null, false, 'low1')
// Gross: 110

// Super-reduced: 2.1%
calculator.calculate(100, 'FR', null, false, 'super-reduced')
// Gross: 102.10
```

### United Kingdom (GB)

```typescript
// Standard: 20%
calculator.calculate(100, 'GB')
// Gross: 120

// Reduced: 5%
calculator.calculate(100, 'GB', null, false, 'low')
// Gross: 105

// Zero rate (super-reduced): 0%
calculator.calculate(100, 'GB', null, false, 'super-reduced')
// Gross: 100
```

## Special Territories

Certain territories have special VAT rules:

### Germany - Special Zones

```typescript
// Heligoland - No VAT
calculator.calculate(100, 'DE', '27498')
// Rate: 0%

// Busingen - No VAT
calculator.calculate(100, 'DE', '78266')
// Rate: 0%
```

### Spain - Special Territories

```typescript
// Canary Islands - No VAT
calculator.calculate(100, 'ES', '35001')
// Rate: 0%

calculator.calculate(100, 'ES', '38001')
// Rate: 0%

// Mainland Spain - Normal VAT
calculator.calculate(100, 'ES', '28001')
// Rate: 21%
```

### Portugal - Autonomous Regions

```typescript
// Azores - Reduced rate
calculator.calculate(100, 'PT', '9500')
// Rate: 16% (instead of 23%)

// Madeira - Reduced rate
calculator.calculate(100, 'PT', '9000')
// Rate: 22% (instead of 23%)
```

### Greece - Mount Athos

```typescript
// Mount Athos - No VAT
calculator.calculate(100, 'EL', '63086')
// Rate: 0%
```

### Austria - German Tax Enclaves

```typescript
// Jungholz & Mittelberg - German VAT applies
calculator.calculate(100, 'AT', '6691')
// Rate: 19% (German rate instead of Austrian 20%)
```

## B2B Transactions

### Domestic B2B

Same country business-to-business:

```typescript
const calculator = new VatCalculator({
  businessCountryCode: 'DE',
})

// German business selling to German business
const result = calculator.calculate(100, 'DE', null, true)
// VAT applies normally
// Rate: 19%
```

### Cross-Border B2B (Reverse Charge)

EU cross-border business-to-business:

```typescript
const calculator = new VatCalculator({
  businessCountryCode: 'DE',
})

// German business selling to French business
const result = calculator.calculate(100, 'FR', null, true)

console.log(result)
// {
//   netPrice: 100,
//   grossPrice: 100,
//   vatAmount: 0,
//   vatRate: 0,
//   details: {
//     reverseCharge: true,
//   },
// }
```

## Calculation Result

The calculation returns a detailed result object:

```typescript
interface VatCalculationResult {
  netPrice: number         // Price before VAT
  grossPrice: number       // Price including VAT
  vatAmount: number        // VAT amount
  vatRate: number          // Applied VAT rate (0.19 = 19%)
  countryCode: CountryCode // Customer country
  isCompany: boolean       // B2B flag

  details?: {
    ruleApplied?: string         // Rate type applied
    reverseCharge?: boolean      // Reverse charge applied
    vatNumberUsed?: string       // VAT number if validated
    postalCodeUsed?: string      // Postal code if used
  }
}
```

## Batch Calculations

Process multiple calculations efficiently:

```typescript
const calculator = new VatCalculator({
  businessCountryCode: 'DE',
})

const orders = [
  { price: 100, country: 'FR', isB2B: false },
  { price: 200, country: 'DE', isB2B: true },
  { price: 150, country: 'ES', isB2B: false },
]

const results = orders.map(order =>
  calculator.calculate(
    order.price,
    order.country,
    null,
    order.isB2B,
  )
)

// Calculate totals
const total = results.reduce((sum, r) => ({
  netTotal: sum.netTotal + r.netPrice,
  vatTotal: sum.vatTotal + r.vatAmount,
  grossTotal: sum.grossTotal + r.grossPrice,
}), { netTotal: 0, vatTotal: 0, grossTotal: 0 })

console.log(total)
// {
//   netTotal: 450,
//   vatTotal: 51.50,
//   grossTotal: 501.50,
// }
```

## Custom VAT Rules

Override default VAT rules:

```typescript
import { VatCalculator, defaultVatRules } from 'ts-vat'

const customRules = {
  ...defaultVatRules,
  // Override Germany rates
  DE: {
    rate: 0.19,
    rates: {
      high: 0.19,
      low: 0.07,
    },
    exceptions: {
      Heligoland: 0,
    },
  },
}

const calculator = new VatCalculator({
  rules: customRules,
})
```

## Next Steps

- [Getting Started](/guide/getting-started) - Basic usage
- [MOSS Compliance](/guide/moss) - MOSS regulations
