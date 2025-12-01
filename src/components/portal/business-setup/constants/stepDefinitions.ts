export interface StepDefinition {
    number: number
    id: string
    title: string
    description: string
}

export const STEP_DEFINITIONS: StepDefinition[] = [
    {
        number: 1,
        id: 'country',
        title: 'Country',
        description: 'Select jurisdiction'
    },
    {
        number: 2,
        id: 'type',
        title: 'Business Type',
        description: 'Entity structure'
    },
    {
        number: 3,
        id: 'license',
        title: 'License',
        description: 'Verify details'
    },
    {
        number: 4,
        id: 'details',
        title: 'Details',
        description: 'Business info'
    },
    {
        number: 5,
        id: 'documents',
        title: 'Documents',
        description: 'Upload files'
    },
    {
        number: 6,
        id: 'review',
        title: 'Review',
        description: 'Confirm data'
    },
    {
        number: 7,
        id: 'status',
        title: 'Status',
        description: 'Submission'
    }
]
