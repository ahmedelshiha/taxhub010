export interface SetupFormData {
  // Step 1: Country
  country?: string

  // Step 2: Business Type
  businessType?: 'existing' | 'new' | 'individual'

  // Step 3: License
  licenseNumber?: string
  businessName?: string
  licenseExpiry?: string
  activities?: string[]

  // Step 4: Details
  economicZone?: string
  legalForm?: string
  taxId?: string
  phone?: string
  email?: string
  website?: string

  // Step 5: Documents
  documents?: SetupDocument[]

  // Step 6: Review
  termsAccepted?: boolean
}

export interface SetupDocument {
  id: string
  name: string
  size: number
  type: string
  url?: string
  status: 'uploading' | 'complete' | 'error'
  progress?: number
}

export interface ValidationResult {
  field: string
  message: string
}

export interface SetupContextType {
  currentStep: number
  completedSteps: number[]
  formData: SetupFormData
  isLoading: boolean
  isSavingDraft: boolean
  lastSavedAt: Date | null
  validationErrors: ValidationResult[]
  showHelpPanel: boolean
  actions: {
    updateFormData: (data: Partial<SetupFormData>) => void
    goToStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void
    saveDraft: () => Promise<void>
    submitSetup: () => Promise<{ success: boolean; entityId?: string; error?: string }>
    setValidationErrors: (errors: ValidationResult[]) => void
    clearValidationErrors: () => void
    markStepComplete: (step: number) => void
    setShowHelpPanel: (show: boolean) => void
    onComplete?: (entityId: string) => void
  }
}

export type Country = "AE" | "SA" | "EG"

export interface TabProps {
  onError: (message: string) => void
  onComplete: (entityId: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export type BusinessType = 'existing' | 'new' | 'individual'

export interface SetupWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: (entityId: string) => void
}

export interface EconomicZone {
  id: string
  name: string
  country: Country
}

export interface LegalForm {
  id: string
  name: string
  country: Country
}

export interface LicenseLookupResult {
  found: boolean
  businessName?: string
  licenseNumber?: string
  expiryDate?: string
  activities?: string[]
  [key: string]: any
}
