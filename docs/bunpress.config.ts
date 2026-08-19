import type { BunPressConfig } from '@stacksjs/bunpress'

const config: BunPressConfig = {
  title: 'ts-vat',
  description: 'Easily handle EU MOSS tax & VAT regulations',
  url: 'https://ts-vat.stacksjs.org',

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/stacksjs/ts-vat' },
      { icon: 'discord', link: 'https://discord.gg/stacksjs' },
      { icon: 'twitter', link: 'https://twitter.com/stacksjs' },
    ],
    colors: {
      primary: '#6366f1',
    },
  },

  sidebar: [
    {
      text: 'Introduction',
      link: '/',
    },
    {
      text: 'Guide',
      items: [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'VAT Calculation', link: '/guide/calculation' },
        { text: 'MOSS Compliance', link: '/guide/moss' },
      ],
    },
    {
      text: 'Features',
      items: [
        { text: 'VAT Validation', link: '/features/validation' },
        { text: 'Rate Lookup', link: '/features/rates' },
        { text: 'Country Detection', link: '/features/country-detection' },
        { text: 'Invoice Generation', link: '/features/invoices' },
      ],
    },
    {
      text: 'Advanced',
      items: [
        { text: 'B2B Exemptions', link: '/advanced/b2b' },
        { text: 'Rate Updates', link: '/advanced/rate-updates' },
        { text: 'Multi-Currency', link: '/advanced/currency' },
        { text: 'Reporting', link: '/advanced/reporting' },
      ],
    },
  ],

  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/getting-started' },
    { text: 'GitHub', link: 'https://github.com/stacksjs/ts-vat' },
  ],

}

export default config
