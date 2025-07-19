
export const OIL_GAS_CATEGORIES = [
  'Flanges',
  'Rope Access Equipment', 
  'Subsea Connectors',
  'Pipe Cleaning Tools',
  'Pressure Testing Units',
  'Rental Tanks',
  'Measurement & Instrumentation'
] as const

export type OilGasCategory = typeof OIL_GAS_CATEGORIES[number]

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Flanges': 'Pipe connection components for secure joints',
  'Rope Access Equipment': 'Safety gear and tools for elevated work',
  'Subsea Connectors': 'Underwater connection systems and hardware',
  'Pipe Cleaning Tools': 'Equipment for pipeline maintenance and cleaning',
  'Pressure Testing Units': 'Devices for testing system pressure integrity',
  'Rental Tanks': 'Temporary storage solutions for various applications',
  'Measurement & Instrumentation': 'Precision tools for monitoring and measurement'
}
