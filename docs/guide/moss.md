# MOSS Compliance

Guide for handling EU Mini One-Stop Shop (MOSS) regulations with ts-vat.

## What is MOSS?

MOSS (Mini One-Stop Shop) is an EU VAT scheme that simplifies VAT obligations for businesses selling digital services to consumers in other EU countries. Under MOSS:

- VAT is charged at the rate of the customer's country
- Businesses register in one EU country and report all EU sales
- No need to register for VAT in each EU country

## Digital Services

MOSS applies to telecommunications, broadcasting, and electronic services (TBE):

- **Telecommunications**: Phone calls, SMS, internet access
- **Broadcasting**: TV, radio, streaming
- **Electronic Services**: Software, apps, e-books, online gaming, SaaS

## B2C Sales (Consumer)

When selling to consumers (B2C), charge VAT at the customer's country rate:

```typescript
import { VatCalculator } from 'ts-vat'

const calculator = new VatCalculator({
  businessCountryCode: 'DE', // Your business location
})

// German business selling to French consumer
const result = calculator.calculate(
  100,     // Net price
  'FR',    // Customer country
  null,    // Postal code
  false,   // Not a company (B2C)
)

console.log(result)
// {
//   netPrice: 100,
//   grossPrice: 120,
//   vatAmount: 20,
//   vatRate: 0.20,  // French rate, not German
//   countryCode: 'FR',
// }
```

### Multiple Countries

```typescript
const countries = ['FR', 'IT', 'ES', 'NL', 'BE']

const sales = countries.map(country => {
  const result = calculator.calculate(100, country, null, false)
  return {
    country,
    vatRate: result.vatRate * 100,
    grossPrice: result.grossPrice,
  }
})

console.log(sales)
// [
//   { country: 'FR', vatRate: 20, grossPrice: 120 },
//   { country: 'IT', vatRate: 22, grossPrice: 122 },
//   { country: 'ES', vatRate: 21, grossPrice: 121 },
//   { country: 'NL', vatRate: 21, grossPrice: 121 },
//   { country: 'BE', vatRate: 21, grossPrice: 121 },
// ]
```

## B2B Sales (Business)

When selling to businesses (B2B), reverse charge applies:

```typescript
const calculator = new VatCalculator({
  businessCountryCode: 'DE',
})

// German business selling to French business
const result = calculator.calculate(
  100,
  'FR',
  null,
  true,  // Is a company (B2B)
)

console.log(result)
// {
//   netPrice: 100,
//   grossPrice: 100,  // No VAT charged
//   vatAmount: 0,
//   vatRate: 0,
//   details: {
//     reverseCharge: true,  // Customer handles VAT
//   },
// }
```

### VAT Number Validation

For B2B sales, validate the customer's VAT number:

```typescript
const calculator = new VatCalculator({
  businessCountryCode: 'DE',
})

// Validate VAT number
const isValid = await calculator.isValidVatNumber('FR12345678901')

if (isValid) {
  // Apply reverse charge
  const result = calculator.calculate(100, 'FR', null, true)
}
else {
  // Treat as B2C, charge French VAT
  const result = calculator.calculate(100, 'FR', null, false)
}
```

### Get Business Details

```typescript
const details = await calculator.getVatDetails('FR12345678901')

console.log(details)
// {
//   isValid: true,
//   name: 'ACME Corporation',
//   address: '123 Rue de Paris, 75001 Paris',
//   countryCode: 'FR',
//   vatNumber: '12345678901',
//   isCompany: true,
// }
```

## VAT Number Formats

Each country has specific VAT number formats:

```typescript
// Germany: DE + 9 digits
'DE123456789'

// France: FR + 2 chars + 9 digits
'FRXX123456789'

// United Kingdom: GB + 9 or 12 digits
'GB123456789'
'GB123456789012'

// Italy: IT + 11 digits
'IT12345678901'

// Spain: ES + 1 char + 7 digits + 1 char
'ESX1234567X'
```

## MOSS Reporting

Generate MOSS-compatible sales data:

```typescript
interface MossSale {
  date: Date
  customerCountry: string
  netAmount: number
  vatRate: number
  vatAmount: number
  isB2B: boolean
}

function generateMossReport(sales: MossSale[]) {
  // Group by country
  const byCountry = sales
    .filter(sale => !sale.isB2B) // MOSS only for B2C
    .reduce((acc, sale) => {
      const country = sale.customerCountry
      if (!acc[country]) {
        acc[country] = {
          country,
          vatRate: sale.vatRate,
          totalNet: 0,
          totalVat: 0,
        }
      }
      acc[country].totalNet += sale.netAmount
      acc[country].totalVat += sale.vatAmount
      return acc
    }, {} as Record<string, any>)

  return Object.values(byCountry)
}

// Example usage
const calculator = new VatCalculator({ businessCountryCode: 'DE' })

const sales: MossSale[] = [
  {
    date: new Date(),
    customerCountry: 'FR',
    ...calculator.calculate(100, 'FR'),
    isB2B: false,
  },
  // ... more sales
]

const report = generateMossReport(sales)
console.log(report)
```

## Thresholds and Registration

### EU-Wide Threshold

As of 2021, a EUR 10,000 threshold applies:

- Below threshold: You may charge your domestic VAT rate
- Above threshold: You must charge customer's country VAT rate

```typescript
// Track sales to determine if threshold reached
let euSalesTotal = 0

function recordSale(price: number, country: string, isB2B: boolean) {
  const calculator = new VatCalculator({ businessCountryCode: 'DE' })

  if (!isB2B && country !== 'DE') {
    euSalesTotal += price
  }

  // Check if threshold exceeded
  const useCustomerCountryVat = euSalesTotal > 10000

  if (useCustomerCountryVat || isB2B) {
    return calculator.calculate(price, country, null, isB2B)
  }
  else {
    // Below threshold, use domestic rate
    return calculator.calculate(price, 'DE')
  }
}
```

## Determining Customer Location

For MOSS, you need evidence of customer location:

```typescript
interface CustomerEvidence {
  billingAddress: { country: string; postalCode?: string }
  ipAddress?: string
  bankCountry?: string
  phonePrefix?: string
}

function determineCustomerCountry(evidence: CustomerEvidence): string {
  // Use billing address as primary evidence
  return evidence.billingAddress.country
}

// Apply in calculation
const customerCountry = determineCustomerCountry(evidence)
const result = calculator.calculate(100, customerCountry)
```

## Exemptions

Some scenarios are exempt from MOSS:

```typescript
// Physical goods - not covered by MOSS
// (use place of supply rules instead)

// Services to businesses (B2B) with valid VAT number
// (reverse charge applies)

// Services to non-EU customers
// (usually no VAT applies)
function calculateVat(
  price: number,
  country: string,
  isEU: boolean,
  isB2B: boolean,
  vatNumber?: string,
) {
  const calculator = new VatCalculator({ businessCountryCode: 'DE' })

  // Non-EU customer
  if (!isEU) {
    return { netPrice: price, vatAmount: 0, grossPrice: price }
  }

  // B2B with valid VAT number
  if (isB2B && vatNumber) {
    const isValid = await calculator.isValidVatNumber(vatNumber)
    if (isValid) {
      return calculator.calculate(price, country, null, true)
    }
  }

  // B2C or invalid VAT number
  return calculator.calculate(price, country, null, false)
}
```

## Error Handling

Handle VIES service unavailability:

```typescript
import { VatCheckUnavailableException } from 'ts-vat'

const calculator = new VatCalculator({
  businessCountryCode: 'DE',
  forwardSoapFaults: true,
})

try {
  const isValid = await calculator.isValidVatNumber('FR12345678901')
}
catch (error) {
  if (error instanceof VatCheckUnavailableException) {
    // VIES service is down
    // Implement fallback logic
    console.log('VAT validation service unavailable')

    // Option 1: Proceed with B2C rate (safer)
    const result = calculator.calculate(100, 'FR', null, false)

    // Option 2: Queue for later validation
    // queueForLaterValidation(vatNumber)
  }
}
```

## Best Practices

1. **Always validate VAT numbers** before applying reverse charge
2. **Keep evidence** of customer location for at least 10 years
3. **Use consistent rates** - check for rate changes quarterly
4. **Handle special territories** - some areas have different rules
5. **Track thresholds** - monitor EUR 10,000 EU-wide threshold

## Next Steps

- [Getting Started](/guide/getting-started) - Basic usage
- [VAT Calculation](/guide/calculation) - Calculation details
