# Invoice Customization Guide

This guide explains the advanced customization features of the Invoice Generator application.

## Template Customization

The application now supports multiple invoice templates with customizable colors and layouts.

### Available Templates

| Template | Description |
|----------|-------------|
| Professional | A clean, professional design with subtle colors |
| Modern | A vibrant, contemporary design with bold colors |
| Minimal | A minimalist template with a clean layout |
| Bold | A bold template with strong colors and clear sections |
| Classic | A traditional invoice layout with a timeless design |

### Color Customization

Each template has its own default colors, but you can customize:

- **Primary Color**: Used for headings, buttons, and accents
- **Secondary Color**: Used for backgrounds and secondary elements

To customize colors:
1. Open the "Invoice Customization" panel at the top of the application
2. Use the color pickers to select your preferred colors
3. Colors can be reset to template defaults using the "x" button

## Multi-Currency Support

The application now supports multiple currencies with proper formatting.

### Available Currencies

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- INR (Indian Rupee)
- CNY (Chinese Yuan)
- BRL (Brazilian Real)

### Currency Features

- Proper symbol placement (prefix or suffix)
- Correct decimal and thousand separators
- Appropriate decimal precision
- Currency code display

To change currency:
1. Open the "Invoice Customization" panel
2. Click the currency selector
3. Choose your preferred currency from the dropdown

## Additional Fields and Options

The application now supports a wide range of additional invoice fields and options.

### Payment Information

- **Payment Terms**: Specify standard terms like "Net 30" or custom terms
- **Bank Details**: Add account information for direct transfers
- **Due Date Calculation**: Set invoices to be due in a specific number of days

### Business Information

- **Purchase Order Number**: Add a reference to a client's PO
- **VAT/Tax Number**: Include tax registration numbers
- **Issue Date**: Track when the invoice was issued

### Shipping Details

Enable shipping information to include:
- Recipient name
- Complete shipping address
- Shipping method
- Shipping cost (automatically added to invoice total)

### Discount Options

- Apply an overall discount percentage to the invoice
- Discount amount is automatically calculated and deducted from the total

### Tax Configuration

- Create multiple tax rates with custom names
- Enable a dedicated tax column for better visibility
- Each line item can have its own tax rate

### Signature Lines

- Option to include signature spaces for customer and company
- Useful for contracts or work orders requiring approval

## Using Optional Sections

Each additional section can be toggled on/off:

1. Open the "Additional Invoice Options" section in the edit view
2. Check the "Show on Invoice" checkbox next to each section you want to include
3. Fill in the relevant information for enabled sections
4. The preview will update to show only the enabled sections

## Saving Templates and Preferences

If you save an invoice to the database, your customization settings will be saved with it, including:

- Template selection
- Color customization
- Currency settings
- Enabled optional sections
- Additional field data

You can create a library of differently styled invoices for various clients or purposes.

## PDF Generation

When generating PDFs, all customizations will be preserved in the output file:

- Template styling will be accurately rendered
- Currency formatting will be maintained
- Additional fields will be included based on your settings

The filename of your downloaded PDF will include the invoice number for easy identification.
