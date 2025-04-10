// Define template types and configuration options
export interface TemplateColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface TemplateConfig {
  id: string
  name: string
  description: string
  colors: TemplateColors
  layout: 'standard' | 'compact' | 'modern' | 'minimal'
  logoPosition: 'left' | 'right' | 'center'
  showBorders: boolean
  showHeaderBorder: boolean
  showFooterBorder: boolean
  fontFamily: string
  cornerStyle: 'square' | 'rounded' | 'pill'
  lineItemStyle: 'alternating' | 'bordered' | 'minimal'
  preview: string // Path to preview image
}

// Define available templates
export const invoiceTemplates: TemplateConfig[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'A clean, professional template with a subtle color scheme',
    colors: {
      primary: '#2563eb', // Blue
      secondary: '#e5e7eb', // Light Gray
      accent: '#1e40af', // Darker Blue
      background: '#ffffff', // White
      text: '#1f2937', // Dark Gray
    },
    layout: 'standard',
    logoPosition: 'left',
    showBorders: true,
    showHeaderBorder: true,
    showFooterBorder: true,
    fontFamily: 'Inter, sans-serif',
    cornerStyle: 'rounded',
    lineItemStyle: 'alternating',
    preview: '/templates/professional.png',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'A modern template with a vibrant color scheme',
    colors: {
      primary: '#7c3aed', // Purple
      secondary: '#f3f4f6', // Light Gray
      accent: '#5b21b6', // Darker Purple
      background: '#ffffff', // White
      text: '#111827', // Dark Gray
    },
    layout: 'modern',
    logoPosition: 'right',
    showBorders: false,
    showHeaderBorder: true,
    showFooterBorder: false,
    fontFamily: 'Poppins, sans-serif',
    cornerStyle: 'rounded',
    lineItemStyle: 'minimal',
    preview: '/templates/modern.png',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'A minimalist template with a clean layout',
    colors: {
      primary: '#111827', // Dark Gray
      secondary: '#f9fafb', // Very Light Gray
      accent: '#6b7280', // Medium Gray
      background: '#ffffff', // White
      text: '#374151', // Gray
    },
    layout: 'minimal',
    logoPosition: 'center',
    showBorders: false,
    showHeaderBorder: false,
    showFooterBorder: false,
    fontFamily: 'Inter, sans-serif',
    cornerStyle: 'square',
    lineItemStyle: 'minimal',
    preview: '/templates/minimal.png',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'A bold template with strong colors and clear sections',
    colors: {
      primary: '#ef4444', // Red
      secondary: '#fee2e2', // Light Red
      accent: '#b91c1c', // Darker Red
      background: '#ffffff', // White
      text: '#111827', // Dark Gray
    },
    layout: 'standard',
    logoPosition: 'left',
    showBorders: true,
    showHeaderBorder: true,
    showFooterBorder: true,
    fontFamily: 'Roboto, sans-serif',
    cornerStyle: 'square',
    lineItemStyle: 'bordered',
    preview: '/templates/bold.png',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional invoice layout with a timeless design',
    colors: {
      primary: '#047857', // Green
      secondary: '#ecfdf5', // Light Green
      accent: '#065f46', // Darker Green
      background: '#ffffff', // White
      text: '#1f2937', // Dark Gray
    },
    layout: 'standard',
    logoPosition: 'left',
    showBorders: true,
    showHeaderBorder: true,
    showFooterBorder: true,
    fontFamily: 'Times New Roman, serif',
    cornerStyle: 'square',
    lineItemStyle: 'bordered',
    preview: '/templates/classic.png',
  }
];

// Get a template by ID
export function getTemplateById(id: string): TemplateConfig {
  const template = invoiceTemplates.find(t => t.id === id);
  return template || invoiceTemplates[0]; // Return the default template if not found
}
