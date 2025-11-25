import prisma from '../src/lib/prisma'
import { TenantStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

function genPasswordFromEnv(envName: string) {
  const env = process.env[envName]
  if (env && env.trim().length > 0) return env
  const generated = crypto.randomBytes(6).toString('hex')
  console.warn(`Warning: ${envName} not set, generated temporary password: ${generated}`)
  return generated
}

async function main() {
  console.log('🌱 Starting enhanced seed...')

  const SEED_FAIL_FAST = process.env.SEED_FAIL_FAST === 'true'

  // Create primary tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'primary' },
    update: {
      name: 'Primary Accounting Tenant',
      status: TenantStatus.ACTIVE,
    },
    create: {
      slug: 'primary',
      name: 'Primary Accounting Tenant',
      status: TenantStatus.ACTIVE,
      description: 'Default seeded tenant for the accounting firm demo environment',
    },
  })

  console.log('✅ Tenant created')

  // Seed languages registry (new feature)
  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      flag: '🇺🇸',
      bcp47Locale: 'en-US',
      enabled: true,
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'rtl',
      flag: '🇸🇦',
      bcp47Locale: 'ar-SA',
      enabled: true,
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      direction: 'ltr',
      flag: '🇮🇳',
      bcp47Locale: 'hi-IN',
      enabled: true,
    },
  ]

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {
        name: lang.name,
        nativeName: lang.nativeName,
        direction: lang.direction,
        bcp47Locale: lang.bcp47Locale,
        enabled: lang.enabled,
      },
      create: lang,
    })
  }

  console.log('✅ Languages created')

  // Seed organizational localization settings (new feature)
  await prisma.organizationLocalizationSettings.upsert({
    where: { tenantId: defaultTenant.id },
    update: {
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      showLanguageSwitcher: true,
      persistLanguagePreference: true,
      autoDetectBrowserLanguage: true,
      allowUserLanguageOverride: true,
      enableRtlSupport: true,
      missingTranslationBehavior: 'show-fallback',
    },
    create: {
      tenantId: defaultTenant.id,
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      showLanguageSwitcher: true,
      persistLanguagePreference: true,
      autoDetectBrowserLanguage: true,
      allowUserLanguageOverride: true,
      enableRtlSupport: true,
      missingTranslationBehavior: 'show-fallback',
    },
  })

  console.log('✅ Organization localization settings created')

  // Seed regional formats (new feature)
  const regionalFormats = [
    {
      tenantId: defaultTenant.id,
      languageCode: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: 'HH:mm:ss',
      currencyCode: 'USD',
      currencySymbol: '$',
      numberFormat: '#,##0.00',
      decimalSeparator: '.',
      thousandsSeparator: ',',
    },
    {
      tenantId: defaultTenant.id,
      languageCode: 'ar',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm:ss',
      currencyCode: 'SAR',
      currencySymbol: '﷼',
      numberFormat: '#,##0.00',
      decimalSeparator: '٫',
      thousandsSeparator: '٬',
    },
    {
      tenantId: defaultTenant.id,
      languageCode: 'hi',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm:ss',
      currencyCode: 'INR',
      currencySymbol: '₹',
      numberFormat: '#,##,##0.00',
      decimalSeparator: '.',
      thousandsSeparator: ',',
    },
  ]

  for (const format of regionalFormats) {
    await prisma.regionalFormat.upsert({
      where: {
        tenantId_languageCode: {
          tenantId: format.tenantId,
          languageCode: format.languageCode,
        },
      },
      update: format,
      create: format,
    })
  }

  console.log('✅ Regional formats created')

  // Seed crowdin integration (new feature)
  await prisma.crowdinIntegration.upsert({
    where: { tenantId: defaultTenant.id },
    update: {
      projectId: 'demo-accounting-project',
      apiTokenMasked: '****demo-token',
      autoSyncDaily: true,
      syncOnDeploy: false,
      createPrs: true,
      testConnectionOk: true,
      lastSyncStatus: 'success',
      lastSyncAt: new Date(),
    },
    create: {
      tenantId: defaultTenant.id,
      projectId: 'demo-accounting-project',
      apiTokenMasked: '****demo-token',
      apiTokenEncrypted: 'demo-encrypted-token',
      autoSyncDaily: true,
      syncOnDeploy: false,
      createPrs: true,
      testConnectionOk: true,
      lastSyncStatus: 'success',
      lastSyncAt: new Date(),
    },
  })

  console.log('✅ Crowdin integration created')

  // Ensure tenant SecuritySettings with superAdmin defaults
  try {
    const existingSec = await prisma.securitySettings.findUnique({ where: { tenantId: defaultTenant.id } })
    if (!existingSec) {
      await prisma.securitySettings.create({
        data: {
          tenantId: defaultTenant.id,
          passwordPolicy: {},
          sessionSecurity: {},
          twoFactor: {},
          network: {},
          dataProtection: {},
          compliance: {},
          superAdmin: { stepUpMfa: false, logAdminAccess: true },
        },
      })
    } else {
      const prev: any = (existingSec as any).superAdmin || {}
      await prisma.securitySettings.update({
        where: { id: existingSec.id },
        data: {
          superAdmin: {
            stepUpMfa: typeof prev.stepUpMfa === 'boolean' ? prev.stepUpMfa : false,
            logAdminAccess: typeof prev.logAdminAccess === 'boolean' ? prev.logAdminAccess : true,
          },
        },
      })
    }
  } catch (e) {
    console.warn('Skipping SecuritySettings seed (may run only after migrations):', (e as any)?.message)
  }

  // Purge deprecated demo users
  await prisma.booking.deleteMany({ where: { clientEmail: 'sarah@example.com' } })
  await prisma.user.deleteMany({ where: { email: 'sarah@example.com' } })
  await prisma.booking.deleteMany({ where: { clientEmail: 'john@example.com' } })
  await prisma.user.deleteMany({ where: { email: 'john@example.com' } })

  // Passwords
  const adminPlain = genPasswordFromEnv('SEED_ADMIN_PASSWORD')
  const staffPlain = genPasswordFromEnv('SEED_STAFF_PASSWORD')
  const clientPlain = genPasswordFromEnv('SEED_CLIENT_PASSWORD')
  const leadPlain = genPasswordFromEnv('SEED_LEAD_PASSWORD')
  const superadminPlain = genPasswordFromEnv('SEED_SUPERADMIN_PASSWORD')

  const adminPassword = await bcrypt.hash(adminPlain, 12)
  const staffPassword = await bcrypt.hash(staffPlain, 12)
  const clientPassword = await bcrypt.hash(clientPlain, 12)
  const leadPassword = await bcrypt.hash(leadPlain, 12)
  const superadminPassword = await bcrypt.hash(superadminPlain, 12)

  // Create users
  const [admin, staff, client1, client2, lead, superadmin] = await prisma.$transaction(async (tx) => {
    const a = await tx.user.upsert({
      where: { tenantId_email: { tenantId: defaultTenant.id, email: 'admin@accountingfirm.com' } },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        email: 'admin@accountingfirm.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    })

    const s = await tx.user.upsert({
      where: { tenantId_email: { tenantId: defaultTenant.id, email: 'staff@accountingfirm.com' } },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        email: 'staff@accountingfirm.com',
        name: 'Staff Member',
        password: staffPassword,
        role: 'TEAM_MEMBER',
        emailVerified: new Date(),
      },
    })

    const c1 = await tx.user.upsert({
      where: { tenantId_email: { tenantId: defaultTenant.id, email: 'client1@example.com' } },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        email: 'client1@example.com',
        name: 'Client One',
        password: clientPassword,
        role: 'CLIENT',
        emailVerified: new Date(),
      },
    })

    const c2 = await tx.user.upsert({
      where: { tenantId_email: { tenantId: defaultTenant.id, email: 'client2@example.com' } },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        email: 'client2@example.com',
        name: 'Client Two',
        password: clientPassword,
        role: 'CLIENT',
        emailVerified: new Date(),
      },
    })

    const l = await tx.user.upsert({
      where: { tenantId_email: { tenantId: defaultTenant.id, email: 'lead@accountingfirm.com' } },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        email: 'lead@accountingfirm.com',
        name: 'Team Lead',
        password: leadPassword,
        role: 'TEAM_LEAD',
        emailVerified: new Date(),
      },
    })

    const sa = await tx.user.upsert({
      where: { tenantId_email: { tenantId: defaultTenant.id, email: 'superadmin@accountingfirm.com' } },
      update: {
        password: superadminPassword,
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
      },
      create: {
        tenantId: defaultTenant.id,
        email: 'superadmin@accountingfirm.com',
        name: 'Super Admin',
        password: superadminPassword,
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
      },
    })

    return [a, s, c1, c2, l, sa]
  })

  console.log('✅ Users created (including SUPER_ADMIN)')

  // Create team members
  let tmStaff = await prisma.teamMember.findFirst({ where: { userId: staff.id } })
  if (!tmStaff) {
    tmStaff = await prisma.teamMember.create({
      data: {
        name: staff.name || 'Staff Member',
        email: staff.email || 'staff@accountingfirm.com',
        userId: staff.id,
        title: 'Accountant',
        role: 'TEAM_MEMBER' as any,
        department: 'Operations',
        specialties: ['Bookkeeping', 'Payroll'],
        hourlyRate: 75,
        isAvailable: true,
        timeZone: 'UTC',
        maxConcurrentBookings: 3,
        bookingBuffer: 15,
        workingHours: {},
      },
    })
  }

  let tmLead = await prisma.teamMember.findFirst({ where: { userId: lead.id } })
  if (!tmLead) {
    tmLead = await prisma.teamMember.create({
      data: {
        name: lead.name || 'Team Lead',
        email: lead.email || 'lead@accountingfirm.com',
        userId: lead.id,
        title: 'Team Lead',
        role: 'TEAM_LEAD' as any,
        department: 'Advisory',
        specialties: ['Tax', 'CFO'],
        hourlyRate: 120,
        isAvailable: true,
        timeZone: 'UTC',
        maxConcurrentBookings: 5,
        bookingBuffer: 15,
        workingHours: {},
      },
    })
  }

  console.log('✅ Team members created')

  // User Profile Enhancements
  const userProfiles = [
    { userId: admin.id, organization: 'Primary Accounting Firm', phoneNumber: '+1-555-0100', timezone: 'America/New_York', preferredLanguage: 'en' },
    { userId: staff.id, organization: 'Primary Accounting Firm', phoneNumber: '+1-555-0101', timezone: 'America/Chicago', preferredLanguage: 'en' },
    { userId: client1.id, organization: 'Tech Startup Inc', phoneNumber: '+1-555-0102', timezone: 'America/Los_Angeles', preferredLanguage: 'en' },
    { userId: client2.id, organization: 'Wilson Consulting', phoneNumber: '+1-555-0103', timezone: 'America/Denver', preferredLanguage: 'en' },
    { userId: lead.id, organization: 'Primary Accounting Firm', phoneNumber: '+1-555-0104', timezone: 'America/New_York', preferredLanguage: 'en' },
    { userId: superadmin.id, organization: 'Primary Accounting Firm', phoneNumber: '+1-555-0105', timezone: 'UTC', preferredLanguage: 'en' },
  ]

  for (const profile of userProfiles) {
    await prisma.userProfile.upsert({
      where: { userId: profile.userId },
      update: profile,
      create: {
        ...profile,
        twoFactorEnabled: false,
        bookingEmailCancellation: true,
        bookingEmailConfirm: true,
        bookingEmailReminder: true,
        bookingEmailReschedule: true,
        bookingSmsConfirmation: false,
        bookingSmsReminder: false,
        reminderHours: [24, 2],
      },
    })
  }

  console.log('✅ User profiles created')

  // NotificationSettings for users
  const notificationSettings = [
    { userId: admin.id, emailOnBookingConfirmed: true, emailOnBookingRescheduled: true, emailOnBookingCancelled: true, smsNotifications: false },
    { userId: staff.id, emailOnBookingConfirmed: true, emailOnBookingRescheduled: true, emailOnBookingCancelled: true, smsNotifications: false },
    { userId: client1.id, emailOnBookingConfirmed: true, emailOnBookingRescheduled: true, emailOnBookingCancelled: true, smsNotifications: true },
    { userId: client2.id, emailOnBookingConfirmed: true, emailOnBookingRescheduled: true, emailOnBookingCancelled: true, smsNotifications: false },
    { userId: lead.id, emailOnBookingConfirmed: true, emailOnBookingRescheduled: true, emailOnBookingCancelled: true, smsNotifications: true },
    { userId: superadmin.id, emailOnBookingConfirmed: true, emailOnBookingRescheduled: true, emailOnBookingCancelled: true, smsNotifications: true },
  ]

  for (const settings of notificationSettings) {
    await prisma.notificationSettings.upsert({
      where: { userId: settings.userId },
      update: settings,
      create: settings,
    })
  }

  console.log('✅ Notification settings created')

  // SidebarPreferences for users
  const sidebarPrefs = [
    { userId: admin.id, collapsed: false, theme: 'light', sidebarWidth: 280, showLabels: true, favoriteItems: ['dashboard', 'clients', 'services', 'invoices'] },
    { userId: staff.id, collapsed: false, theme: 'light', sidebarWidth: 280, showLabels: true, favoriteItems: ['dashboard', 'bookings', 'tasks'] },
    { userId: client1.id, collapsed: false, theme: 'light', sidebarWidth: 280, showLabels: true, favoriteItems: ['dashboard', 'services', 'invoices'] },
    { userId: client2.id, collapsed: false, theme: 'light', sidebarWidth: 280, showLabels: true, favoriteItems: ['dashboard', 'bookings'] },
    { userId: lead.id, collapsed: false, theme: 'light', sidebarWidth: 280, showLabels: true, favoriteItems: ['dashboard', 'team', 'reports', 'clients'] },
    { userId: superadmin.id, collapsed: false, theme: 'light', sidebarWidth: 280, showLabels: true, favoriteItems: ['dashboard', 'users', 'settings', 'audit-logs'] },
  ]

  for (const prefs of sidebarPrefs) {
    await prisma.sidebarPreferences.upsert({
      where: { userId: prefs.userId },
      update: { ...prefs, userId: undefined },
      create: prefs,
    })
  }

  console.log('✅ Sidebar preferences created')

  // Create services
  const services = [
    {
      name: 'Bookkeeping Services',
      slug: 'bookkeeping',
      description: `Our comprehensive bookkeeping services ensure your financial records are accurate, up-to-date, and compliant with regulations. We handle everything from daily transaction recording to monthly financial statements, giving you peace of mind and more time to focus on growing your business.

Our experienced bookkeepers use the latest accounting software and follow industry best practices to maintain your books. We provide detailed monthly reports, help with bank reconciliations, and ensure all your financial data is organized and accessible when you need it.`,
      shortDesc: 'Professional bookkeeping services to keep your financial records organized and up-to-date.',
      features: [
        'Daily transaction recording',
        'Monthly financial statements',
        'Bank reconciliation',
        'Accounts payable/receivable management',
        'Expense categorization',
        'QuickBooks setup and maintenance',
        'Monthly reporting and analysis',
        'Tax preparation support',
      ],
      price: 299.0,
      duration: 60,
      category: 'Bookkeeping',
      featured: true,
      active: true,
    },
    {
      name: 'Tax Preparation',
      slug: 'tax-preparation',
      description: `Maximize your tax savings with our expert tax preparation services. Our certified tax professionals stay current with the latest tax laws and regulations to ensure you receive every deduction and credit you're entitled to while remaining fully compliant.

We handle both individual and business tax returns, providing year-round tax planning advice to help minimize your tax liability. Our comprehensive approach includes tax strategy consultation, quarterly estimated tax payments, and representation in case of IRS inquiries.`,
      shortDesc: 'Expert tax preparation and planning to maximize your savings and ensure compliance.',
      features: [
        'Individual tax returns (1040)',
        'Business tax returns (1120, 1120S, 1065)',
        'Tax planning and strategy',
        'Quarterly estimated payments',
        'IRS representation',
        'Multi-state tax filing',
        'Tax amendment services',
        'Year-round tax consultation',
      ],
      price: 450.0,
      duration: 90,
      category: 'Tax',
      featured: true,
      active: true,
    },
    {
      name: 'Payroll Management',
      slug: 'payroll',
      description: `Streamline your payroll process with our comprehensive payroll management services. We handle everything from calculating wages and deductions to filing payroll taxes and providing detailed reporting, ensuring your employees are paid accurately and on time.

Our payroll services include compliance with federal, state, and local regulations, direct deposit setup, and integration with your existing accounting systems. We also provide year-end tax documents and support for payroll-related inquiries.`,
      shortDesc: 'Complete payroll management including tax filing, direct deposits, and compliance.',
      features: [
        'Bi-weekly/monthly payroll processing',
        'Direct deposit setup',
        'Payroll tax filing and payments',
        'W-2 and 1099 preparation',
        'Time tracking integration',
        'Benefits administration',
        'Compliance monitoring',
        'Employee self-service portal',
      ],
      price: 199.0,
      duration: 45,
      category: 'Payroll',
      featured: false,
      active: true,
    },
    {
      name: 'CFO Advisory Services',
      slug: 'cfo-advisory',
      description: `Get strategic financial guidance without the cost of a full-time CFO. Our advisory services provide you with expert financial leadership to help drive business growth, improve profitability, and make informed strategic decisions.

We work closely with business owners and management teams to develop financial strategies, create budgets and forecasts, analyze performance metrics, and identify opportunities for improvement. Our CFO services are scalable and can be customized to meet your specific business needs.`,
      shortDesc: 'Strategic financial guidance and CFO-level expertise for growing businesses.',
      features: [
        'Financial strategy development',
        'Budget and forecast creation',
        'Cash flow management',
        'KPI development and monitoring',
        'Financial analysis and reporting',
        'Investment and funding guidance',
        'Risk assessment and management',
        'Board presentation support',
      ],
      price: 750.0,
      duration: 120,
      category: 'Advisory',
      featured: true,
      active: true,
    },
    {
      name: 'Business Consultation',
      slug: 'business-consultation',
      description: `Get expert advice on various business and financial matters with our consultation services. Whether you're starting a new business, considering a major financial decision, or need guidance on accounting software selection, our experienced professionals are here to help.

Our consultation sessions are designed to provide you with actionable insights and recommendations tailored to your specific situation. We cover topics ranging from business structure optimization to financial process improvements.`,
      shortDesc: 'Expert business and financial consultation for specific needs and questions.',
      features: [
        'Business structure advice',
        'Accounting software selection',
        'Financial process optimization',
        'Compliance guidance',
        'Growth strategy consultation',
        'Cost reduction analysis',
        'System implementation support',
        'Custom financial solutions',
      ],
      price: 150.0,
      duration: 60,
      category: 'Consultation',
      featured: false,
      active: true,
    },
  ]

  for (const service of services) {
    const exists = await prisma.service.findFirst({ where: { slug: service.slug, tenantId: defaultTenant.id }, select: { id: true } })
    if (!exists) {
      await prisma.service.create({ data: { ...service, tenant: { connect: { id: defaultTenant.id } } } as any })
    }
  }

  console.log('✅ Services created')

  // Seed service requests and bookings
  const svcBookkeeping = await prisma.service.findFirst({ where: { slug: 'bookkeeping' }, select: { id: true, name: true } })
  const svcTax = await prisma.service.findFirst({ where: { slug: 'tax-preparation' }, select: { id: true, name: true } })
  if (svcBookkeeping && svcTax) {
    await prisma.serviceRequest.upsert({
      where: { id: 'sr_demo_1' },
      update: {},
      create: {
        id: 'sr_demo_1',
        client: { connect: { id: client1.id } },
        service: { connect: { id: svcBookkeeping.id } },
        tenant: { connect: { id: defaultTenant.id } },
        title: `${svcBookkeeping.name} request — ${client1.name}`,
        description: 'Initial bookkeeping setup and monthly processing.',
        priority: 'MEDIUM',
        status: 'SUBMITTED',
        budgetMin: 250,
        budgetMax: 500,
        deadline: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 14),
        requirements: { serviceSnapshot: { id: svcBookkeeping.id, name: svcBookkeeping.name } },
      },
    })
    await prisma.serviceRequest.upsert({
      where: { id: 'sr_demo_2' },
      update: {},
      create: {
        id: 'sr_demo_2',
        client: { connect: { id: client2.id } },
        service: { connect: { id: svcTax.id } },
        tenant: { connect: { id: defaultTenant.id } },
        title: `${svcTax.name} request — ${client2.name}`,
        description: 'Corporate tax return preparation with multi-state filing.',
        priority: 'HIGH',
        status: 'IN_REVIEW',
        budgetMin: 400,
        budgetMax: 1200,
        deadline: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
        requirements: { serviceSnapshot: { id: svcTax.id, name: svcTax.name } },
      },
    })
    console.log('✅ Sample service requests created')

    try {
      await prisma.serviceRequest.update({ where: { id: 'sr_demo_1' }, data: { assignedTeamMemberId: tmStaff.id, assignedBy: admin.id, assignedAt: new Date() } })
      await prisma.serviceRequest.update({ where: { id: 'sr_demo_2' }, data: { assignedTeamMemberId: tmLead.id, assignedBy: admin.id, assignedAt: new Date() } })
      const sr1 = await prisma.serviceRequest.findUnique({ where: { id: 'sr_demo_1' } })
      const sr2 = await prisma.serviceRequest.findUnique({ where: { id: 'sr_demo_2' } })

      if (svcBookkeeping && sr1) {
        const start1 = new Date()
        start1.setDate(start1.getDate() + 3)
        start1.setHours(10, 0, 0, 0)
        const svc1 = await prisma.service.findUnique({ where: { id: svcBookkeeping.id }, select: { duration: true } })
        await prisma.booking.upsert({
          where: { id: 'bk_demo_1' },
          update: {},
          create: {
            id: 'bk_demo_1',
            client: { connect: { id: client1.id } },
            service: { connect: { id: svcBookkeeping.id } },
            tenant: { connect: { id: defaultTenant.id } },
            status: 'PENDING' as any,
            scheduledAt: start1,
            duration: svc1?.duration ?? 60,
            clientName: client1.name || 'Client One',
            clientEmail: client1.email,
            assignedTeamMember: { connect: { id: tmStaff.id } },
            serviceRequest: { connect: { id: sr1.id } },
            confirmed: false,
          },
        })
      }

      if (svcTax && sr2) {
        const start2 = new Date()
        start2.setDate(start2.getDate() + 5)
        start2.setHours(14, 0, 0, 0)
        const svc2 = await prisma.service.findUnique({ where: { id: svcTax.id }, select: { duration: true } })
        await prisma.booking.upsert({
          where: { id: 'bk_demo_2' },
          update: {},
          create: {
            id: 'bk_demo_2',
            client: { connect: { id: client2.id } },
            service: { connect: { id: svcTax.id } },
            tenant: { connect: { id: defaultTenant.id } },
            status: 'CONFIRMED' as any,
            scheduledAt: start2,
            duration: svc2?.duration ?? 90,
            clientName: client2.name || 'Client Two',
            clientEmail: client2.email,
            assignedTeamMember: { connect: { id: tmLead.id } },
            serviceRequest: { connect: { id: sr2.id } },
            confirmed: true,
          },
        })
      }
      console.log('✅ Demo bookings created')
    } catch (e) {
      console.warn('Skipping assignments/bookings due to error:', (e as any)?.message)
      if (SEED_FAIL_FAST) {
        throw e
      }
    }
  }

  // Create blog posts
  const posts = [
    {
      title: '5 Tax Deductions Small Businesses Often Miss',
      slug: '5-tax-deductions-small-businesses-miss',
      content: `# 5 Tax Deductions Small Businesses Often Miss

Tax season can be stressful for small business owners, but it's also an opportunity to save money through legitimate deductions. Many businesses miss out on significant savings simply because they're unaware of all the deductions available to them.

## 1. Home Office Expenses

If you use part of your home exclusively for business, you may be able to deduct home office expenses. This includes a portion of your rent or mortgage, utilities, and home maintenance costs. The key word here is "exclusively" – the space must be used only for business purposes.

## 2. Business Meals

Business meals are generally 50% deductible, but during 2021 and 2022, business meals from restaurants were 100% deductible. Make sure you're taking advantage of this temporary benefit while it lasts.

## 3. Professional Development

Courses, conferences, books, and other educational materials that help you improve your business skills are deductible. This includes online courses, industry publications, and professional memberships.

## 4. Business Insurance

Most types of business insurance are deductible, including general liability, professional liability, and business property insurance. Don't forget about health insurance premiums if you're self-employed.

## 5. Equipment and Software

Computers, software, office furniture, and other business equipment can often be deducted in the year of purchase through Section 179 deduction or bonus depreciation.

Remember to keep detailed records and receipts for all business expenses. When in doubt, consult with a qualified tax professional to ensure you're maximizing your deductions while staying compliant with tax laws.`,
      excerpt: 'Discover commonly overlooked tax deductions that could save your small business money this tax season.',
      published: true,
      featured: true,
      tags: ['tax', 'deductions', 'small-business', 'savings'],
      readTime: 5,
      views: 1250,
      authorId: admin.id,
      seoTitle: '5 Tax Deductions Small Businesses Often Miss - Save Money This Tax Season',
      seoDescription: 'Learn about 5 commonly overlooked tax deductions that could save your small business thousands of dollars. Expert tips from certified accountants.',
      publishedAt: new Date('2024-01-15'),
    },
    {
      title: 'Why Every Small Business Needs Professional Bookkeeping',
      slug: 'why-small-business-needs-professional-bookkeeping',
      content: `# Why Every Small Business Needs Professional Bookkeeping

Many small business owners try to handle their own bookkeeping to save money, but this approach often costs more in the long run. Professional bookkeeping is an investment that pays dividends in accuracy, compliance, and peace of mind.

## Accuracy and Compliance

Professional bookkeepers are trained to maintain accurate records and stay current with changing regulations. They know how to properly categorize expenses, handle depreciation, and ensure your books are audit-ready.

## Time Savings

The time you spend on bookkeeping is time you're not spending on growing your business. Professional bookkeepers can handle your financial records efficiently, freeing you to focus on what you do best.

## Better Financial Insights

Professional bookkeepers don't just record transactions – they provide valuable insights into your business's financial health. Regular reports help you make informed decisions about cash flow, expenses, and growth opportunities.

## Tax Preparation Benefits

When tax season arrives, having professionally maintained books makes the process much smoother and often results in better tax outcomes. Your tax preparer will have clean, organized records to work with.

## Conclusion

Professional bookkeeping is not just an expense – it's an investment in your business's success. The accuracy, compliance, and insights provided by professional bookkeepers more than justify the cost.`,
      excerpt: 'Learn why professional bookkeeping is essential for small business success and growth.',
      published: true,
      featured: false,
      tags: ['bookkeeping', 'small-business', 'financial-management'],
      readTime: 4,
      views: 890,
      authorId: staff.id,
      seoTitle: 'Why Every Small Business Needs Professional Bookkeeping Services',
      seoDescription: 'Discover the benefits of professional bookkeeping for small businesses, including accuracy, compliance, and better financial insights.',
      publishedAt: new Date('2024-02-01'),
    },
    {
      title: 'Understanding Cash Flow Management for Small Businesses',
      slug: 'cash-flow-management-small-businesses',
      content: `# Understanding Cash Flow Management for Small Businesses

Cash flow is the lifeblood of any business, yet many small business owners struggle with managing it effectively. Understanding and controlling your cash flow is crucial for business survival and growth.

## What is Cash Flow?

Cash flow is the movement of money in and out of your business. Positive cash flow means more money is coming in than going out, while negative cash flow means the opposite.

## Common Cash Flow Challenges

- Seasonal fluctuations in revenue
- Late-paying customers
- Unexpected expenses
- Inventory management issues
- Rapid growth requiring increased working capital

## Strategies for Better Cash Flow Management

### 1. Improve Accounts Receivable
- Offer early payment discounts
- Implement stricter credit policies
- Follow up on overdue accounts promptly
- Consider factoring for immediate cash

### 2. Manage Accounts Payable
- Take advantage of payment terms
- Negotiate better terms with suppliers
- Prioritize payments strategically

### 3. Maintain Cash Reserves
- Keep 3-6 months of expenses in reserve
- Establish a line of credit before you need it
- Consider short-term financing options

## Conclusion

Effective cash flow management requires ongoing attention and planning. Regular monitoring, forecasting, and proactive management can help ensure your business has the cash it needs to operate and grow.`,
      excerpt: 'Master the fundamentals of cash flow management to keep your small business financially healthy.',
      published: true,
      featured: false,
      tags: ['cash-flow', 'financial-management', 'small-business'],
      readTime: 6,
      views: 675,
      authorId: admin.id,
      seoTitle: 'Cash Flow Management Guide for Small Businesses',
      seoDescription: 'Learn essential cash flow management strategies to keep your small business financially healthy and growing.',
      publishedAt: new Date('2024-02-15'),
    },
  ]

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
  }

  console.log('✅ Blog posts created')

  // Support & Knowledge Base
  const kbCategories = [
    { id: 'kb_cat_1', name: 'Tax Guides', slug: 'tax-guides', description: 'Comprehensive guides on tax topics', tenantId: defaultTenant.id, displayOrder: 1 },
    { id: 'kb_cat_2', name: 'Portal Help', slug: 'portal-help', description: 'Help articles for using the client portal', tenantId: defaultTenant.id, displayOrder: 2 },
    { id: 'kb_cat_3', name: 'Accounting Basics', slug: 'accounting-basics', description: 'Introduction to accounting concepts', tenantId: defaultTenant.id, displayOrder: 3 },
    { id: 'kb_cat_4', name: 'Compliance', slug: 'compliance', description: 'Compliance and regulatory information', tenantId: defaultTenant.id, displayOrder: 4 },
  ]

  for (const cat of kbCategories) {
    await prisma.knowledgeBaseCategory.upsert({
      where: { id: cat.id },
      update: { ...cat, id: undefined },
      create: cat,
    })
  }

  console.log('✅ Knowledge base categories created')

  const kbArticles = [
    {
      id: 'kb_art_1',
      categoryId: 'kb_cat_1',
      tenantId: defaultTenant.id,
      title: 'Understanding Quarterly Tax Payments',
      slug: 'quarterly-tax-payments',
      content: 'Quarterly tax payments are required if you expect to owe $1,000 or more in taxes. Learn how to calculate and submit your estimated tax payments.',
      authorId: admin.id,
      published: true,
      views: 245,
      helpfulVotes: 18,
      displayOrder: 1,
    },
    {
      id: 'kb_art_2',
      categoryId: 'kb_cat_1',
      tenantId: defaultTenant.id,
      title: 'Deductions vs Credits: What\'s the Difference?',
      slug: 'deductions-vs-credits',
      content: 'Understanding the difference between tax deductions and tax credits is essential for maximizing your tax savings. Deductions reduce your taxable income, while credits directly reduce your tax liability.',
      authorId: admin.id,
      published: true,
      views: 189,
      helpfulVotes: 14,
      displayOrder: 2,
    },
    {
      id: 'kb_art_3',
      categoryId: 'kb_cat_2',
      tenantId: defaultTenant.id,
      title: 'How to Upload Documents to Your Portal',
      slug: 'upload-documents-portal',
      content: 'Follow these simple steps to upload your financial documents to the client portal for easy sharing with your accountant.',
      authorId: staff.id,
      published: true,
      views: 567,
      helpfulVotes: 52,
      displayOrder: 1,
    },
    {
      id: 'kb_art_4',
      categoryId: 'kb_cat_2',
      tenantId: defaultTenant.id,
      title: 'Viewing Your Financial Reports',
      slug: 'viewing-reports',
      content: 'Learn how to access and interpret your financial reports in the portal, including income statements, balance sheets, and cash flow summaries.',
      authorId: staff.id,
      published: true,
      views: 423,
      helpfulVotes: 35,
      displayOrder: 2,
    },
    {
      id: 'kb_art_5',
      categoryId: 'kb_cat_3',
      tenantId: defaultTenant.id,
      title: 'What is Bookkeeping?',
      slug: 'what-is-bookkeeping',
      content: 'Bookkeeping is the process of recording, classifying, and organizing all financial transactions of a business. It\'s the foundation of good financial management.',
      authorId: admin.id,
      published: true,
      views: 312,
      helpfulVotes: 28,
      displayOrder: 1,
    },
    {
      id: 'kb_art_6',
      categoryId: 'kb_cat_4',
      tenantId: defaultTenant.id,
      title: 'GDPR Compliance Requirements',
      slug: 'gdpr-compliance',
      content: 'General Data Protection Regulation (GDPR) imposes strict requirements on how you handle personal data. Learn about your compliance obligations.',
      authorId: admin.id,
      published: true,
      views: 178,
      helpfulVotes: 12,
      displayOrder: 1,
    },
  ]

  for (const article of kbArticles) {
    await prisma.knowledgeBaseArticle.upsert({
      where: { id: article.id },
      update: { ...article, id: undefined },
      create: article as any,
    })
  }

  console.log('✅ Knowledge base articles created')

  // Support Tickets
  const supportTickets = [
    {
      id: 'ticket_1',
      tenantId: defaultTenant.id,
      createdById: client1.id,
      assignedToId: staff.id,
      title: 'Unable to upload quarterly documents',
      description: 'I\'m having trouble uploading my quarterly financial documents. The upload keeps failing.',
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      category: 'PORTAL_HELP' as const,
    },
    {
      id: 'ticket_2',
      tenantId: defaultTenant.id,
      createdById: client2.id,
      assignedToId: staff.id,
      title: 'Question about tax deductions',
      description: 'Can you clarify which business expenses are deductible this year?',
      priority: 'MEDIUM' as const,
      status: 'OPEN' as const,
      category: 'TAX_QUESTION' as const,
    },
    {
      id: 'ticket_3',
      tenantId: defaultTenant.id,
      createdById: client1.id,
      assignedToId: staff.id,
      title: 'Invoice not reflecting in my account',
      description: 'The recent invoice from your firm is not showing up in my portal.',
      priority: 'MEDIUM' as const,
      status: 'RESOLVED' as const,
      category: 'BILLING' as const,
    },
  ]

  for (const ticket of supportTickets) {
    await prisma.supportTicket.upsert({
      where: { id: ticket.id },
      update: { ...ticket, id: undefined },
      create: ticket,
    })
  }

  console.log('✅ Support tickets created')

  // Support Ticket Comments
  const ticketComments = [
    {
      id: 'comment_1',
      ticketId: 'ticket_1',
      tenantId: defaultTenant.id,
      createdById: staff.id,
      content: 'I\'ve reviewed your account. It looks like the file size exceeded our limit. Try uploading files under 10MB.',
    },
    {
      id: 'comment_2',
      ticketId: 'ticket_1',
      tenantId: defaultTenant.id,
      createdById: client1.id,
      content: 'Thank you! I\'ll try splitting the documents and upload them separately.',
    },
    {
      id: 'comment_3',
      ticketId: 'ticket_2',
      tenantId: defaultTenant.id,
      createdById: staff.id,
      content: 'Generally, ordinary and necessary business expenses are deductible. This includes office supplies, equipment, professional fees, etc. Let me schedule a detailed consultation to review your specific situation.',
    },
    {
      id: 'comment_4',
      ticketId: 'ticket_3',
      tenantId: defaultTenant.id,
      createdById: staff.id,
      content: 'We\'ve corrected the billing issue. The invoice should now appear in your portal. Please refresh your browser.',
    },
  ]

  for (const comment of ticketComments) {
    await prisma.supportTicketComment.upsert({
      where: { id: comment.id },
      update: { ...comment, id: undefined },
      create: comment,
    })
  }

  console.log('✅ Support ticket comments created')

  // Communication & Notifications
  const notifications = [
    {
      id: 'notif_1',
      tenantId: defaultTenant.id,
      recipientId: client1.id,
      senderId: admin.id,
      title: 'Your Quarterly Tax Report is Ready',
      description: 'Your Q3 tax report has been completed and is available for review in your portal.',
      type: 'REPORT_READY' as const,
      status: 'UNREAD' as const,
    },
    {
      id: 'notif_2',
      tenantId: defaultTenant.id,
      recipientId: client2.id,
      senderId: admin.id,
      title: 'Invoice Paid Successfully',
      description: 'Your recent invoice has been marked as paid. Thank you!',
      type: 'PAYMENT_RECEIVED' as const,
      status: 'READ' as const,
    },
    {
      id: 'notif_3',
      tenantId: defaultTenant.id,
      recipientId: staff.id,
      senderId: admin.id,
      title: 'New Service Request Assigned',
      description: 'A new bookkeeping service request has been assigned to you.',
      type: 'ASSIGNMENT' as const,
      status: 'UNREAD' as const,
    },
    {
      id: 'notif_4',
      tenantId: defaultTenant.id,
      recipientId: lead.id,
      senderId: admin.id,
      title: 'Team Performance Report',
      description: 'Your weekly team performance report is ready.',
      type: 'REPORT_READY' as const,
      status: 'UNREAD' as const,
    },
    {
      id: 'notif_5',
      tenantId: defaultTenant.id,
      recipientId: admin.id,
      senderId: staff.id,
      title: 'Task Completed',
      description: 'The quarterly compliance review has been completed.',
      type: 'TASK_COMPLETED' as const,
      status: 'READ' as const,
    },
  ]

  for (const notif of notifications) {
    await prisma.notification.upsert({
      where: { id: notif.id },
      update: { ...notif, id: undefined },
      create: notif,
    })
  }

  console.log('✅ Notifications created')

  // Direct Messages
  const messages = [
    {
      id: 'msg_1',
      tenantId: defaultTenant.id,
      senderId: admin.id,
      recipientId: staff.id,
      subject: 'Follow up on Client Request',
      content: 'Can you please follow up with Client One regarding their bookkeeping setup? They should have received our initial questionnaire.',
      isRead: true,
    },
    {
      id: 'msg_2',
      tenantId: defaultTenant.id,
      senderId: staff.id,
      recipientId: admin.id,
      subject: 'Re: Follow up on Client Request',
      content: 'I\'ll reach out to them today. I\'ll send you an update by end of day.',
      isRead: true,
    },
    {
      id: 'msg_3',
      tenantId: defaultTenant.id,
      senderId: client1.id,
      recipientId: admin.id,
      subject: 'Question about Invoice',
      content: 'Hi, I received your invoice but have a question about the service breakdown. Can we discuss?',
      isRead: false,
    },
    {
      id: 'msg_4',
      tenantId: defaultTenant.id,
      senderId: lead.id,
      recipientId: staff.id,
      subject: 'Great Work on Tax Return',
      content: 'Excellent job on the tax return preparation. Your attention to detail is appreciated.',
      isRead: true,
    },
  ]

  for (const msg of messages) {
    await prisma.message.upsert({
      where: { id: msg.id },
      update: { ...msg, id: undefined },
      create: msg,
    })
  }

  console.log('✅ Direct messages created')

  // Chat Messages
  const chatMessages = [
    {
      id: 'chat_1',
      tenantId: defaultTenant.id,
      userId: admin.id,
      content: 'Welcome to the team channel! This is where we discuss general project updates.',
      channel: 'general',
      isSystemMessage: true,
    },
    {
      id: 'chat_2',
      tenantId: defaultTenant.id,
      userId: staff.id,
      content: 'Thanks for the welcome! Looking forward to collaborating with everyone.',
      channel: 'general',
      isSystemMessage: false,
    },
    {
      id: 'chat_3',
      tenantId: defaultTenant.id,
      userId: lead.id,
      content: 'Don\'t forget that the quarterly review meeting is scheduled for next Friday at 2 PM.',
      channel: 'general',
      isSystemMessage: false,
    },
    {
      id: 'chat_4',
      tenantId: defaultTenant.id,
      userId: admin.id,
      content: 'Great reminder. I\'ll send out the meeting details to everyone.',
      channel: 'general',
      isSystemMessage: false,
    },
    {
      id: 'chat_5',
      tenantId: defaultTenant.id,
      userId: staff.id,
      content: 'Quick question about the new client onboarding process.',
      channel: 'operations',
      isSystemMessage: false,
    },
    {
      id: 'chat_6',
      tenantId: defaultTenant.id,
      userId: lead.id,
      content: 'Sure, what would you like to know?',
      channel: 'operations',
      isSystemMessage: false,
    },
  ]

  for (const chat of chatMessages) {
    await prisma.chatMessage.upsert({
      where: { id: chat.id },
      update: { ...chat, id: undefined },
      create: chat,
    })
  }

  console.log('✅ Chat messages created')

  // Create task templates
  const templates = [
    {
      id: 'tmpl_client_onboarding',
      name: 'Client Onboarding Checklist',
      content: 'Collect KYC documents; Set up client in CRM; Configure billing; Schedule kickoff call',
      description: 'Standard onboarding steps for new clients',
      category: 'Operations',
      defaultPriority: 'MEDIUM',
      defaultCategory: 'client',
      estimatedHours: 4,
      checklistItems: ['Collect KYC documents', 'Set up client in CRM', 'Configure billing & invoicing', 'Schedule kickoff call'],
      requiredSkills: ['Compliance', 'CRM'],
      defaultAssigneeRole: 'TEAM_MEMBER',
    },
    {
      id: 'tmpl_vat_return',
      name: 'Monthly VAT Return',
      content: 'Collect invoices; Reconcile transactions; Prepare VAT report; Submit return',
      description: 'Recurring VAT filing workflow',
      category: 'Compliance',
      defaultPriority: 'HIGH',
      defaultCategory: 'compliance',
      estimatedHours: 3,
      checklistItems: ['Collect invoices', 'Reconcile transactions', 'Prepare VAT report', 'Submit return', 'Archive documentation'],
      requiredSkills: ['VAT', 'Bookkeeping'],
      defaultAssigneeRole: 'TEAM_MEMBER',
    },
    {
      id: 'tmpl_quarterly_audit',
      name: 'Quarterly Audit Review',
      content: 'Plan audit; Sample transactions; Draft findings; Review with client',
      description: 'Quarterly audit review steps',
      category: 'Audit',
      defaultPriority: 'MEDIUM',
      defaultCategory: 'finance',
      estimatedHours: 8,
      checklistItems: ['Plan audit scope', 'Sample transactions', 'Draft findings', 'Review with client'],
      requiredSkills: ['Audit', 'Risk Assessment'],
      defaultAssigneeRole: 'TEAM_LEAD',
    },
  ]

  for (const t of templates) {
    await prisma.taskTemplate.upsert({
      where: { id: t.id },
      update: {},
      create: t as any,
    })
  }

  console.log('✅ Default task templates created')

  // Documents & Approvals
  const documentVersions = [
    {
      id: 'doc_v_1',
      tenantId: defaultTenant.id,
      uploaderId: admin.id,
      fileName: 'Client_Onboarding_Agreement.pdf',
      fileType: 'application/pdf',
      fileSize: 245680,
      uploadedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
      version: 1,
      documentType: 'AGREEMENT' as const,
      status: 'PUBLISHED' as const,
    },
    {
      id: 'doc_v_2',
      tenantId: defaultTenant.id,
      uploaderId: staff.id,
      fileName: 'Tax_Return_2024.pdf',
      fileType: 'application/pdf',
      fileSize: 892310,
      uploadedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3),
      version: 1,
      documentType: 'TAX_RETURN' as const,
      status: 'DRAFT' as const,
    },
    {
      id: 'doc_v_3',
      tenantId: defaultTenant.id,
      uploaderId: admin.id,
      fileName: 'Tax_Return_2024.pdf',
      fileType: 'application/pdf',
      fileSize: 892310,
      uploadedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 1),
      version: 2,
      documentType: 'TAX_RETURN' as const,
      status: 'PUBLISHED' as const,
    },
    {
      id: 'doc_v_4',
      tenantId: defaultTenant.id,
      uploaderId: lead.id,
      fileName: 'Financial_Statement_Q3_2024.xlsx',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSize: 567890,
      uploadedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 5),
      version: 1,
      documentType: 'FINANCIAL_STATEMENT' as const,
      status: 'PUBLISHED' as const,
    },
  ]

  for (const doc of documentVersions) {
    await prisma.documentVersion.upsert({
      where: { id: doc.id },
      update: { ...doc, id: undefined },
      create: doc,
    })
  }

  console.log('✅ Document versions created')

  // Approvals
  const approvals = [
    {
      id: 'appr_1',
      tenantId: defaultTenant.id,
      requesterId: client1.id,
      approverId: admin.id,
      documentVersionId: 'doc_v_1',
      type: 'DOCUMENT_REVIEW' as const,
      status: 'APPROVED' as const,
      reason: 'Verified and approved for use',
      decidedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      id: 'appr_2',
      tenantId: defaultTenant.id,
      requesterId: staff.id,
      approverId: lead.id,
      documentVersionId: 'doc_v_2',
      type: 'DOCUMENT_REVIEW' as const,
      status: 'PENDING' as const,
      reason: 'Awaiting manager approval for final tax return',
    },
    {
      id: 'appr_3',
      tenantId: defaultTenant.id,
      requesterId: client2.id,
      approverId: admin.id,
      type: 'EXPENSE_REPORT' as const,
      status: 'APPROVED' as const,
      reason: 'All expenses verified',
      decidedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 1),
    },
    {
      id: 'appr_4',
      tenantId: defaultTenant.id,
      requesterId: staff.id,
      approverId: lead.id,
      type: 'TIME_OFF' as const,
      status: 'PENDING' as const,
      reason: 'Vacation request for next month',
    },
  ]

  for (const appr of approvals) {
    await prisma.approval.upsert({
      where: { id: appr.id },
      update: { ...appr, id: undefined },
      create: appr,
    })
  }

  console.log('✅ Approvals created')

  // Approval History
  const approvalHistories = [
    {
      id: 'appr_hist_1',
      tenantId: defaultTenant.id,
      approvalId: 'appr_1',
      performedBy: admin.id,
      action: 'APPROVED' as const,
      comment: 'Document looks good and complies with all standards',
      metadata: { reviewTime: 45, pages: 15 },
    },
    {
      id: 'appr_hist_2',
      tenantId: defaultTenant.id,
      approvalId: 'appr_3',
      performedBy: admin.id,
      action: 'APPROVED' as const,
      comment: 'All receipts verified and amounts match supporting documentation',
      metadata: { expenseCount: 12, totalAmount: 2450 },
    },
    {
      id: 'appr_hist_3',
      tenantId: defaultTenant.id,
      approvalId: 'appr_1',
      performedBy: client1.id,
      action: 'SUBMITTED' as const,
      comment: 'Initial submission for review',
    },
  ]

  for (const hist of approvalHistories) {
    await prisma.approvalHistory.upsert({
      where: { id: hist.id },
      update: { ...hist, id: undefined },
      create: hist,
    })
  }

  console.log('✅ Approval history created')

  // Create contact submissions
  const contactSubmissions = [
    {
      name: 'Mike Wilson',
      email: 'mike@example.com',
      phone: '+1-555-0789',
      company: 'Wilson Consulting',
      subject: 'Bookkeeping Services Inquiry',
      message: 'Hi, I\'m interested in your bookkeeping services for my consulting business. Could you provide more information about pricing and what\'s included?',
      source: 'website',
      responded: false,
    },
    {
      name: 'Lisa Chen',
      email: 'lisa@techstartup.com',
      phone: '+1-555-0321',
      company: 'Tech Startup Inc',
      subject: 'CFO Advisory Services',
      message: 'We\'re a growing tech startup and need strategic financial guidance. Can we schedule a consultation to discuss your CFO advisory services?',
      source: 'google',
      responded: true,
    },
  ]

  for (const submission of contactSubmissions) {
    await prisma.contactSubmission.create({
      data: submission,
    })
  }

  console.log('✅ Contact submissions created')

  // Create newsletter subscribers
  const newsletterSubscribers = [
    {
      email: 'subscriber1@example.com',
      name: 'Alex Thompson',
      source: 'website',
    },
    {
      email: 'subscriber2@example.com',
      name: 'Maria Garcia',
      source: 'blog',
    },
    {
      email: 'subscriber3@example.com',
      source: 'social-media',
    },
  ]

  for (const subscriber of newsletterSubscribers) {
    await prisma.newsletter.upsert({
      where: { email: subscriber.email },
      update: {
        subscribed: true,
        name: subscriber.name ?? undefined,
        source: subscriber.source,
        updatedAt: new Date(),
      },
      create: {
        email: subscriber.email,
        name: subscriber.name ?? null,
        source: subscriber.source,
        subscribed: true,
      },
    })
  }

  console.log('✅ Newsletter subscribers created')

  // Seed currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, active: true, isDefault: true },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, active: true, isDefault: false },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2, active: true, isDefault: false },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimals: 2, active: false, isDefault: false },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, active: true, isDefault: false },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, active: true, isDefault: false },
    { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, active: true, isDefault: false },
  ]

  for (const cur of currencies) {
    await prisma.currency.upsert({
      where: { code: cur.code },
      update: {
        name: cur.name,
        symbol: cur.symbol,
        decimals: cur.decimals,
        active: cur.active,
        isDefault: cur.isDefault,
        updatedAt: new Date(),
      },
      create: { code: cur.code, name: cur.name, symbol: cur.symbol ?? null, decimals: cur.decimals, active: cur.active, isDefault: cur.isDefault },
    })
  }

  // Insert baseline exchange rates
  const exchangeRates = [
    { base: 'USD', target: 'USD', rate: 1.0 },
    { base: 'USD', target: 'AED', rate: 3.67 },
    { base: 'USD', target: 'SAR', rate: 3.75 },
    { base: 'USD', target: 'EGP', rate: 30.5 },
    { base: 'USD', target: 'INR', rate: 83.12 },
    { base: 'USD', target: 'GBP', rate: 0.79 },
    { base: 'USD', target: 'EUR', rate: 0.92 },
  ]

  for (const rate of exchangeRates) {
    const existing = await prisma.exchangeRate.findFirst({
      where: { base: rate.base, target: rate.target },
    })

    if (existing) {
      await prisma.exchangeRate.update({
        where: { id: existing.id },
        data: { rate: rate.rate, source: 'seed', fetchedAt: new Date(), ttlSeconds: 86400 },
      })
    } else {
      await prisma.exchangeRate.create({
        data: { base: rate.base, target: rate.target, rate: rate.rate, source: 'seed', ttlSeconds: 86400 },
      })
    }
  }

  console.log('✅ Currencies & exchange rates created')

  // Financial & Domain Data
  const bankingConnections = [
    {
      id: 'bc_1',
      tenantId: defaultTenant.id,
      bankName: 'Chase Bank',
      accountNumber: '****1234',
      routingNumber: '021000021',
      accountType: 'CHECKING' as const,
      status: 'ACTIVE' as const,
      isDefault: true,
      syncEnabled: true,
      lastSyncedAt: new Date(),
    },
    {
      id: 'bc_2',
      tenantId: defaultTenant.id,
      bankName: 'Wells Fargo',
      accountNumber: '****5678',
      routingNumber: '121000248',
      accountType: 'SAVINGS' as const,
      status: 'ACTIVE' as const,
      isDefault: false,
      syncEnabled: true,
      lastSyncedAt: new Date(),
    },
  ]

  for (const conn of bankingConnections) {
    await prisma.bankingConnection.upsert({
      where: { id: conn.id },
      update: { ...conn, id: undefined },
      create: conn,
    })
  }

  console.log('✅ Banking connections created')

  // Banking Transactions
  const bankingTransactions = [
    {
      id: 'bt_1',
      tenantId: defaultTenant.id,
      bankingConnectionId: 'bc_1',
      transactionDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 10),
      amount: 5000.00,
      type: 'DEPOSIT' as const,
      description: 'Client payment for bookkeeping services',
      referenceNumber: 'CK-001234',
      status: 'CLEARED' as const,
      category: 'INCOME' as const,
    },
    {
      id: 'bt_2',
      tenantId: defaultTenant.id,
      bankingConnectionId: 'bc_1',
      transactionDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 8),
      amount: 850.00,
      type: 'WITHDRAWAL' as const,
      description: 'Office supplies purchase',
      referenceNumber: 'CHK-005678',
      status: 'CLEARED' as const,
      category: 'EXPENSE' as const,
    },
    {
      id: 'bt_3',
      tenantId: defaultTenant.id,
      bankingConnectionId: 'bc_1',
      transactionDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 5),
      amount: 3200.00,
      type: 'DEPOSIT' as const,
      description: 'Client payment for tax preparation',
      referenceNumber: 'ACH-009012',
      status: 'CLEARED' as const,
      category: 'INCOME' as const,
    },
    {
      id: 'bt_4',
      tenantId: defaultTenant.id,
      bankingConnectionId: 'bc_2',
      transactionDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3),
      amount: 500.00,
      type: 'DEPOSIT' as const,
      description: 'Interest earned',
      referenceNumber: 'INT-001',
      status: 'CLEARED' as const,
      category: 'INCOME' as const,
    },
  ]

  for (const trans of bankingTransactions) {
    await prisma.bankingTransaction.upsert({
      where: { id: trans.id },
      update: { ...trans, id: undefined },
      create: trans,
    })
  }

  console.log('✅ Banking transactions created')

  // Tax Filings
  const taxFilings = [
    {
      id: 'tf_1',
      tenantId: defaultTenant.id,
      entityId: null,
      filingType: '1040' as const,
      taxYear: 2024,
      status: 'DRAFT' as const,
      dueDate: new Date('2025-04-15'),
      submittedDate: null,
      estimatedRefund: 2500.00,
    },
    {
      id: 'tf_2',
      tenantId: defaultTenant.id,
      entityId: null,
      filingType: 'QUARTERLY_ES' as const,
      taxYear: 2024,
      status: 'FILED' as const,
      dueDate: new Date('2024-09-16'),
      submittedDate: new Date('2024-09-10'),
      estimatedTax: 5000.00,
    },
    {
      id: 'tf_3',
      tenantId: defaultTenant.id,
      entityId: null,
      filingType: 'STATE_RETURN' as const,
      taxYear: 2024,
      status: 'FILED' as const,
      dueDate: new Date('2025-04-15'),
      submittedDate: new Date('2025-01-20'),
    },
  ]

  for (const filing of taxFilings) {
    await prisma.taxFiling.upsert({
      where: { id: filing.id },
      update: { ...filing, id: undefined },
      create: filing,
    })
  }

  console.log('✅ Tax filings created')

  // Bills
  const bills = [
    {
      id: 'bill_1',
      tenantId: defaultTenant.id,
      vendorName: 'Software Solutions Inc',
      vendorId: null,
      billNumber: 'BILL-001',
      description: 'Annual software license subscription',
      amountCents: 120000,
      dueDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 15),
      billDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 5),
      status: 'PENDING' as const,
      currency: 'USD',
    },
    {
      id: 'bill_2',
      tenantId: defaultTenant.id,
      vendorName: 'Office Supplies Co',
      vendorId: null,
      billNumber: 'BILL-002',
      description: 'Monthly office supply order',
      amountCents: 45000,
      dueDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
      billDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2),
      status: 'APPROVED' as const,
      currency: 'USD',
    },
    {
      id: 'bill_3',
      tenantId: defaultTenant.id,
      vendorName: 'Professional Services LLC',
      vendorId: null,
      billNumber: 'BILL-003',
      description: 'Consulting services for system implementation',
      amountCents: 350000,
      dueDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 5),
      billDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 25),
      status: 'PAID' as const,
      currency: 'USD',
      paidDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3),
    },
  ]

  for (const bill of bills) {
    await prisma.bill.upsert({
      where: { id: bill.id },
      update: { ...bill, id: undefined },
      create: bill,
    })
  }

  console.log('✅ Bills created')

  // Party (Master Data for vendors, customers, employees)
  const parties = [
    {
      id: 'party_1',
      tenantId: defaultTenant.id,
      name: 'Tech Solutions Ltd',
      type: 'VENDOR' as const,
      email: 'contact@techsolutions.com',
      phone: '+1-555-0200',
      category: 'Software Provider',
      status: 'ACTIVE' as const,
      taxId: '12-3456789',
    },
    {
      id: 'party_2',
      tenantId: defaultTenant.id,
      name: 'Wilson Consulting Group',
      type: 'CUSTOMER' as const,
      email: 'info@wilsongroup.com',
      phone: '+1-555-0300',
      category: 'Corporate Client',
      status: 'ACTIVE' as const,
      taxId: '98-7654321',
    },
    {
      id: 'party_3',
      tenantId: defaultTenant.id,
      name: 'Office Supplies Depot',
      type: 'VENDOR' as const,
      email: 'sales@osdepot.com',
      phone: '+1-555-0400',
      category: 'Supplies',
      status: 'ACTIVE' as const,
    },
    {
      id: 'party_4',
      tenantId: defaultTenant.id,
      name: 'Digital Marketing Pro',
      type: 'CUSTOMER' as const,
      email: 'hello@digitalmarketingpro.com',
      phone: '+1-555-0500',
      category: 'Service Client',
      status: 'ACTIVE' as const,
      taxId: '55-1234567',
    },
  ]

  for (const party of parties) {
    await prisma.party.upsert({
      where: { id: party.id },
      update: { ...party, id: undefined },
      create: party,
    })
  }

  console.log('✅ Parties (vendors/customers) created')

  // Products
  const products = [
    {
      id: 'prod_1',
      tenantId: defaultTenant.id,
      name: 'Bookkeeping Service - Monthly',
      sku: 'BOOK-MONTHLY-001',
      description: 'Monthly bookkeeping service package including transaction recording and reconciliation',
      category: 'Services',
      unitPrice: 29900,
      taxable: true,
      status: 'ACTIVE' as const,
    },
    {
      id: 'prod_2',
      tenantId: defaultTenant.id,
      name: 'Tax Preparation Service',
      sku: 'TAX-PREP-001',
      description: 'Comprehensive tax preparation and filing service',
      category: 'Services',
      unitPrice: 45000,
      taxable: true,
      status: 'ACTIVE' as const,
    },
    {
      id: 'prod_3',
      tenantId: defaultTenant.id,
      name: 'Payroll Processing - Per Employee',
      sku: 'PAYROLL-EMP-001',
      description: 'Monthly payroll processing per employee',
      category: 'Services',
      unitPrice: 5000,
      taxable: true,
      status: 'ACTIVE' as const,
    },
    {
      id: 'prod_4',
      tenantId: defaultTenant.id,
      name: 'Financial Consultation Hour',
      sku: 'CONSULT-HOUR-001',
      description: 'One hour of professional financial consultation',
      category: 'Services',
      unitPrice: 15000,
      taxable: true,
      status: 'ACTIVE' as const,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { ...product, id: undefined },
      create: product,
    })
  }

  console.log('✅ Products created')

  // Seed sample tasks with compliance requirements
  let __canSeedTasks = false
  try {
    const __rows = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='Task' AND column_name='tenantId'`
    __canSeedTasks = Array.isArray(__rows) && (__rows as any).length > 0
  } catch {}

  if (__canSeedTasks) {
    const now = new Date()
    const past = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10)
    const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7)
    const completedPast = new Date(past.getTime() + 1000 * 60 * 60 * 24 * 2)

    const t1 = await prisma.task.upsert({
      where: { id: 'task_c1' },
      update: {
        tenant: { connect: { id: defaultTenant.id } },
        title: 'File Quarterly Compliance Report',
        description: 'Prepare and file the quarterly compliance report for client X',
        dueAt: past,
        priority: 'HIGH',
        status: 'OPEN',
        complianceRequired: true,
        complianceDeadline: past,
      },
      create: {
        id: 'task_c1',
        tenant: { connect: { id: defaultTenant.id } },
        title: 'File Quarterly Compliance Report',
        description: 'Prepare and file the quarterly compliance report for client X',
        dueAt: past,
        priority: 'HIGH',
        status: 'OPEN',
        complianceRequired: true,
        complianceDeadline: past,
      },
    })

    const t2 = await prisma.task.upsert({
      where: { id: 'task_c2' },
      update: {
        tenant: { connect: { id: defaultTenant.id } },
        title: 'Submit AML Documentation',
        description: 'Collect and submit AML documents for onboarding',
        dueAt: future,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        complianceRequired: true,
        complianceDeadline: future,
      },
      create: {
        id: 'task_c2',
        tenant: { connect: { id: defaultTenant.id } },
        title: 'Submit AML Documentation',
        description: 'Collect and submit AML documents for onboarding',
        dueAt: future,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        complianceRequired: true,
        complianceDeadline: future,
      },
    })

    const t3 = await prisma.task.upsert({
      where: { id: 'task_c3' },
      update: {
        tenant: { connect: { id: defaultTenant.id } },
        title: 'Annual Tax Compliance Review',
        description: 'Review annual tax compliance and close items',
        dueAt: future,
        priority: 'MEDIUM',
        status: 'OPEN',
        complianceRequired: false,
      },
      create: {
        id: 'task_c3',
        tenant: { connect: { id: defaultTenant.id } },
        title: 'Annual Tax Compliance Review',
        description: 'Review annual tax compliance and close items',
        dueAt: future,
        priority: 'MEDIUM',
        status: 'OPEN',
        complianceRequired: false,
      },
    })

    // Create compliance records
    await prisma.complianceRecord.upsert({
      where: { id: 'cr_1' },
      update: {
        tenant: { connect: { id: defaultTenant.id } },
        task: { connect: { id: t1.id } },
        type: 'REPORTING',
        status: 'COMPLETED',
        dueAt: past,
        completedAt: completedPast,
        riskScore: 3,
        notes: 'Filed successfully',
      },
      create: {
        id: 'cr_1',
        tenant: { connect: { id: defaultTenant.id } },
        task: { connect: { id: t1.id } },
        type: 'REPORTING',
        status: 'COMPLETED',
        dueAt: past,
        completedAt: completedPast,
        riskScore: 3,
        notes: 'Filed successfully',
      },
    })

    await prisma.complianceRecord.upsert({
      where: { id: 'cr_2' },
      update: {
        tenant: { connect: { id: defaultTenant.id } },
        task: { connect: { id: t2.id } },
        type: 'KYC',
        status: 'PENDING',
        dueAt: future,
        completedAt: null,
        riskScore: 5,
        notes: 'Waiting for client documents',
      },
      create: {
        id: 'cr_2',
        tenant: { connect: { id: defaultTenant.id } },
        task: { connect: { id: t2.id } },
        type: 'KYC',
        status: 'PENDING',
        dueAt: future,
        completedAt: null,
        riskScore: 5,
        notes: 'Waiting for client documents',
      },
    })

    // Assign tasks to users
    try {
      await prisma.task.update({ where: { id: t1.id }, data: { assigneeId: staff.id } })
      await prisma.task.update({ where: { id: t2.id }, data: { assigneeId: staff.id } })
      await prisma.task.update({ where: { id: t3.id }, data: { assigneeId: admin.id } })

      await prisma.requestTask.upsert({
        where: { unique_request_task: { serviceRequestId: 'sr_demo_1', taskId: t1.id } },
        update: {},
        create: { serviceRequestId: 'sr_demo_1', taskId: t1.id },
      })
      await prisma.requestTask.upsert({
        where: { unique_request_task: { serviceRequestId: 'sr_demo_1', taskId: t2.id } },
        update: {},
        create: { serviceRequestId: 'sr_demo_1', taskId: t2.id },
      })
      await prisma.requestTask.upsert({
        where: { unique_request_task: { serviceRequestId: 'sr_demo_2', taskId: t3.id } },
        update: {},
        create: { serviceRequestId: 'sr_demo_2', taskId: t3.id },
      })
    } catch (e) {
      console.warn('Skipping task assignments due to error:', (e as any)?.message)
    }

    console.log('✅ Sample tasks and compliance records created')
  } else {
    console.warn('Skipping Task/Compliance seed: DB schema missing Task.tenantId')
  }

  // Seed translation keys (new feature)
  const translationKeys = [
    { key: 'dashboard.new_metric', namespace: 'dashboard' },
    { key: 'dashboard.revenue', namespace: 'dashboard' },
    { key: 'settings.privacy_notice', namespace: 'settings' },
    { key: 'settings.notifications', namespace: 'settings' },
    { key: 'payment.confirmation', namespace: 'payment' },
    { key: 'payment.invoice_sent', namespace: 'payment' },
    { key: 'booking.confirmed', namespace: 'booking' },
    { key: 'booking.reminder', namespace: 'booking' },
    { key: 'email.welcome', namespace: 'email' },
    { key: 'email.reset_password', namespace: 'email' },
  ]

  for (const tk of translationKeys) {
    await prisma.translationKey.upsert({
      where: { tenantId_key: { tenantId: defaultTenant.id, key: tk.key } },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        key: tk.key,
        namespace: tk.namespace,
        enTranslated: true,
        arTranslated: Math.random() > 0.3,
        hiTranslated: Math.random() > 0.3,
      },
    })
  }

  console.log('✅ Translation keys created')

  // Seed translation metrics (new feature)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  for (let i = 0; i < 7; i++) {
    const metricsDate = new Date(startDate)
    metricsDate.setDate(metricsDate.getDate() + i)
    metricsDate.setHours(0, 0, 0, 0)

    await prisma.translationMetrics.upsert({
      where: { tenantId_date: { tenantId: defaultTenant.id, date: metricsDate } },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        date: metricsDate,
        enTotal: 10,
        enTranslated: 10,
        arTotal: 10,
        arTranslated: 7,
        hiTotal: 10,
        hiTranslated: 8,
        totalUniqueKeys: 10,
        usersWithEnglish: 80,
        usersWithArabic: 10,
        usersWithHindi: 10,
        enCoveragePct: 100,
        arCoveragePct: 70,
        hiCoveragePct: 80,
      },
    })
  }

  console.log('✅ Translation metrics created')

  // Seed health logs (new feature)
  const healthServices = ['DATABASE', 'EMAIL', 'AUTH', 'API', 'PAYMENTS', 'CROWDIN']
  const now = new Date()

  for (let hours = 0; hours < 24; hours += 6) {
    for (const service of healthServices) {
      const checkedAt = new Date(now)
      checkedAt.setHours(checkedAt.getHours() - hours)

      await prisma.healthLog.create({
        data: {
          tenantId: defaultTenant.id,
          service,
          status: Math.random() > 0.1 ? 'healthy' : 'degraded',
          message: Math.random() > 0.1 ? 'OK' : 'Slow response times',
          checkedAt,
        },
      })
    }
  }

  console.log('✅ Health logs created')

  // Seed audit logs (new feature)
  const auditActions = [
    { action: 'user.role_changed', resource: 'users', details: { oldRole: 'TEAM_MEMBER', newRole: 'TEAM_LEAD' } },
    { action: 'settings.updated', resource: 'settings', details: { category: 'booking_settings' } },
    { action: 'service.created', resource: 'services', details: { serviceName: 'Bookkeeping Services' } },
    { action: 'permission.granted', resource: 'permissions', details: { permission: 'INVOICES_VIEW' } },
    { action: 'invoice.generated', resource: 'invoices', details: { invoiceId: 'INV-001' } },
    { action: 'report.exported', resource: 'reports', details: { format: 'PDF' } },
    { action: 'integration.connected', resource: 'integrations', details: { integration: 'crowdin' } },
    { action: 'backup.created', resource: 'system', details: { timestamp: new Date().toISOString() } },
  ]

  for (let i = 0; i < 8; i++) {
    const auditData = auditActions[i % auditActions.length]
    const createdAt = new Date(now)
    createdAt.setHours(createdAt.getHours() - i)

    await prisma.auditLog.create({
      data: {
        tenantId: defaultTenant.id,
        userId: i % 2 === 0 ? admin.id : superadmin.id,
        action: auditData.action,
        resource: auditData.resource,
        metadata: auditData.details,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        createdAt,
      },
    })
  }

  console.log('✅ Audit logs created')

  // Seed sample invoices (new feature)
  const invoiceStatuses = ['DRAFT', 'SENT', 'UNPAID', 'PAID']

  for (let i = 0; i < 5; i++) {
    const invoiceCreatedAt = new Date(now)
    invoiceCreatedAt.setDate(invoiceCreatedAt.getDate() - i * 5)

    const invoiceNumber = `INV-${1000 + i}`

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { number: invoiceNumber },
    })

    if (existingInvoice) {
      continue
    }

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: defaultTenant.id,
        clientId: i % 2 === 0 ? client1.id : client2.id,
        number: invoiceNumber,
        status: invoiceStatuses[i % invoiceStatuses.length] as any,
        currency: 'USD',
        totalCents: (500 + i * 100) * 100,
        createdAt: invoiceCreatedAt,
        paidAt: i === 0 ? invoiceCreatedAt : undefined,
      },
    })

    // Add invoice items
    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        description: 'Professional Services',
        quantity: 1,
        unitPriceCents: invoice.totalCents,
        totalCents: invoice.totalCents,
      },
    })
  }

  console.log('✅ Sample invoices created')

  // Seed sample expenses (new feature)
  const expenseCategories = ['Office Supplies', 'Travel', 'Software', 'Training', 'Equipment']
  const expenseStatuses = ['PENDING', 'APPROVED', 'REJECTED']

  for (let i = 0; i < 8; i++) {
    const expenseDate = new Date(now)
    expenseDate.setDate(expenseDate.getDate() - i)

    await prisma.expense.create({
      data: {
        tenantId: defaultTenant.id,
        userId: i % 2 === 0 ? staff.id : admin.id,
        vendor: `Vendor ${i + 1}`,
        category: expenseCategories[i % expenseCategories.length],
        status: expenseStatuses[i % expenseStatuses.length],
        amountCents: (50 + i * 25) * 100,
        currency: 'USD',
        date: expenseDate,
      },
    })
  }

  console.log('✅ Sample expenses created')

  // Seed custom roles (new feature)
  const customRoles = [
    {
      tenantId: defaultTenant.id,
      name: 'Support Agent',
      description: 'Can view and manage support tickets',
      color: '#3B82F6',
      icon: 'headphones',
      permissions: ['tickets.view', 'tickets.respond', 'clients.view'],
      isActive: true,
      createdBy: admin.id,
    },
    {
      tenantId: defaultTenant.id,
      name: 'Billing Manager',
      description: 'Manage invoices and payments',
      color: '#10B981',
      icon: 'credit-card',
      permissions: ['invoices.view', 'invoices.edit', 'payments.view', 'payments.process'],
      isActive: true,
      createdBy: admin.id,
    },
    {
      tenantId: defaultTenant.id,
      name: 'Content Manager',
      description: 'Manage blog posts and publications',
      color: '#F59E0B',
      icon: 'file-text',
      permissions: ['posts.view', 'posts.create', 'posts.edit', 'posts.publish'],
      isActive: true,
      createdBy: admin.id,
    },
  ]

  for (const role of customRoles) {
    await prisma.customRole.upsert({
      where: { tenantId_name: { tenantId: role.tenantId, name: role.name } },
      update: role,
      create: role,
    })
  }

  console.log('✅ Custom roles created')

  // Seed organization settings
  await prisma.organizationSettings.upsert({
    where: { tenantId: defaultTenant.id },
    update: {
      name: 'Primary Accounting Firm',
      industry: 'Accounting & Finance',
      contactEmail: 'admin@accountingfirm.com',
      contactPhone: '+1-555-0100',
      defaultTimezone: 'UTC',
      defaultCurrency: 'USD',
      defaultLocale: 'en',
    },
    create: {
      tenantId: defaultTenant.id,
      name: 'Primary Accounting Firm',
      industry: 'Accounting & Finance',
      contactEmail: 'admin@accountingfirm.com',
      contactPhone: '+1-555-0100',
      defaultTimezone: 'UTC',
      defaultCurrency: 'USD',
      defaultLocale: 'en',
    },
  })

  console.log('✅ Organization settings created')

  // Advanced Features: Workflows
  const workflowTemplates = [
    {
      id: 'wf_tmpl_1',
      tenantId: defaultTenant.id,
      name: 'Client Onboarding Workflow',
      description: 'Standard workflow for new client onboarding',
      createdBy: admin.id,
      category: 'ONBOARDING' as const,
      isActive: true,
      steps: [
        { stepNumber: 1, name: 'Collect KYC Documents', duration: 1 },
        { stepNumber: 2, name: 'Set Up Client Profile', duration: 1 },
        { stepNumber: 3, name: 'Configure Billing', duration: 1 },
        { stepNumber: 4, name: 'Schedule Kickoff Call', duration: 0.5 },
      ] as any,
    },
    {
      id: 'wf_tmpl_2',
      tenantId: defaultTenant.id,
      name: 'Tax Return Preparation Workflow',
      description: 'Workflow for preparing tax returns',
      createdBy: admin.id,
      category: 'TAX_COMPLIANCE' as const,
      isActive: true,
      steps: [
        { stepNumber: 1, name: 'Request Documents from Client', duration: 2 },
        { stepNumber: 2, name: 'Review and Organize Documents', duration: 2 },
        { stepNumber: 3, name: 'Prepare Draft Return', duration: 4 },
        { stepNumber: 4, name: 'Client Review and Approval', duration: 2 },
        { stepNumber: 5, name: 'File Return', duration: 1 },
      ] as any,
    },
  ]

  for (const tmpl of workflowTemplates) {
    await prisma.workflowTemplate.upsert({
      where: { id: tmpl.id },
      update: { ...tmpl, id: undefined },
      create: tmpl,
    })
  }

  console.log('✅ Workflow templates created')

  // User Workflows
  const userWorkflows = [
    {
      id: 'uw_1',
      tenantId: defaultTenant.id,
      workflowTemplateId: 'wf_tmpl_1',
      userId: client1.id,
      triggeredBy: admin.id,
      status: 'IN_PROGRESS' as const,
      startedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2),
      completedAt: null,
      metadata: { clientName: client1.name } as any,
    },
    {
      id: 'uw_2',
      tenantId: defaultTenant.id,
      workflowTemplateId: 'wf_tmpl_2',
      userId: client2.id,
      triggeredBy: admin.id,
      status: 'PENDING' as const,
      startedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 1),
      completedAt: null,
      metadata: { clientName: client2.name, taxYear: 2024 } as any,
    },
  ]

  for (const uw of userWorkflows) {
    await prisma.userWorkflow.upsert({
      where: { id: uw.id },
      update: { ...uw, id: undefined },
      create: uw,
    })
  }

  console.log('✅ User workflows created')

  // Reports
  const reports = [
    {
      id: 'report_1',
      tenantId: defaultTenant.id,
      createdBy: admin.id,
      name: 'Monthly Revenue Report',
      description: 'Summary of monthly revenue by service',
      type: 'REVENUE' as const,
      frequency: 'MONTHLY' as const,
      status: 'ACTIVE' as const,
      config: { metrics: ['total_revenue', 'revenue_by_service', 'top_clients'] } as any,
    },
    {
      id: 'report_2',
      tenantId: defaultTenant.id,
      createdBy: admin.id,
      name: 'Team Performance Report',
      description: 'Team member performance metrics and utilization',
      type: 'PERFORMANCE' as const,
      frequency: 'WEEKLY' as const,
      status: 'ACTIVE' as const,
      config: { metrics: ['utilization_rate', 'completion_rate', 'client_satisfaction'] } as any,
    },
    {
      id: 'report_3',
      tenantId: defaultTenant.id,
      createdBy: lead.id,
      name: 'Tax Compliance Status',
      description: 'Status of all tax filings and compliance deadlines',
      type: 'COMPLIANCE' as const,
      frequency: 'MONTHLY' as const,
      status: 'ACTIVE' as const,
      config: { metrics: ['filing_status', 'upcoming_deadlines', 'overdue_items'] } as any,
    },
    {
      id: 'report_4',
      tenantId: defaultTenant.id,
      createdBy: admin.id,
      name: 'Client Engagement Report',
      description: 'Client activity and engagement metrics',
      type: 'CLIENT' as const,
      frequency: 'MONTHLY' as const,
      status: 'ACTIVE' as const,
      config: { metrics: ['active_clients', 'service_usage', 'support_tickets'] } as any,
    },
  ]

  for (const report of reports) {
    await prisma.report.upsert({
      where: { id: report.id },
      update: { ...report, id: undefined },
      create: report,
    })
  }

  console.log('✅ Reports created')

  // Entities (business entities like LLC, Corp, etc.)
  const entities = [
    {
      id: 'entity_1',
      tenantId: defaultTenant.id,
      createdBy: admin.id,
      name: 'Primary Accounting Firm LLC',
      type: 'LLC' as const,
      status: 'ACTIVE' as const,
      registrationNumber: 'LLC-2020-001234',
      industry: 'Accounting & Finance',
      foundedDate: new Date('2020-03-15'),
      registrationDate: new Date('2020-03-20'),
      jurisdiction: 'Delaware',
      businessAddress: '123 Business Ave, Suite 100, New York, NY 10001',
      websiteUrl: 'https://www.accountingfirm.com',
      metadata: { employees: 15, revenue: 2500000 } as any,
    },
    {
      id: 'entity_2',
      tenantId: defaultTenant.id,
      createdBy: admin.id,
      name: 'Client Service Division',
      type: 'DIVISION' as const,
      status: 'ACTIVE' as const,
      registrationNumber: 'DIV-2021-005678',
      industry: 'Professional Services',
      parentEntityId: 'entity_1',
      businessAddress: '123 Business Ave, Suite 200, New York, NY 10001',
      metadata: { focus: 'client services', team_size: 8 } as any,
    },
    {
      id: 'entity_3',
      tenantId: defaultTenant.id,
      createdBy: admin.id,
      name: 'Tech Startup Client Inc',
      type: 'C_CORP' as const,
      status: 'ACTIVE' as const,
      registrationNumber: 'CORP-2023-009012',
      industry: 'Software Development',
      foundedDate: new Date('2023-01-10'),
      registrationDate: new Date('2023-01-15'),
      jurisdiction: 'California',
      businessAddress: '456 Tech Drive, San Francisco, CA 94103',
      taxId: '12-3456789',
      metadata: { stage: 'Series A', investors: ['VC Fund 1', 'VC Fund 2'] } as any,
    },
  ]

  for (const entity of entities) {
    await prisma.entity.upsert({
      where: { id: entity.id },
      update: { ...entity, id: undefined },
      create: entity,
    })
  }

  console.log('✅ Entities created')

  // Create associations between users and entities
  try {
    await prisma.userOnEntity.upsert({
      where: { unique_user_entity: { userId: admin.id, entityId: 'entity_1' } },
      update: { role: 'OWNER' },
      create: { userId: admin.id, entityId: 'entity_1', role: 'OWNER' },
    })

    await prisma.userOnEntity.upsert({
      where: { unique_user_entity: { userId: client1.id, entityId: 'entity_3' } },
      update: { role: 'OWNER' },
      create: { userId: client1.id, entityId: 'entity_3', role: 'OWNER' },
    })

    await prisma.userOnEntity.upsert({
      where: { unique_user_entity: { userId: staff.id, entityId: 'entity_1' } },
      update: { role: 'MEMBER' },
      create: { userId: staff.id, entityId: 'entity_1', role: 'MEMBER' },
    })

    console.log('✅ User-entity associations created')
  } catch (e) {
    console.warn('Skipping user-entity associations due to error:', (e as any)?.message)
  }

  // Seed communication settings
  await prisma.communicationSettings.upsert({
    where: { tenantId: defaultTenant.id },
    update: {
      email: { enabled: true, from: 'noreply@accountingfirm.com' },
      sms: { enabled: false },
      chat: { enabled: true },
      notifications: { enabled: true },
      newsletters: { enabled: true },
      reminders: { enabled: true },
    },
    create: {
      tenantId: defaultTenant.id,
      email: { enabled: true, from: 'noreply@accountingfirm.com' },
      sms: { enabled: false },
      chat: { enabled: true },
      notifications: { enabled: true },
      newsletters: { enabled: true },
      reminders: { enabled: true },
    },
  })

  console.log('✅ Communication settings created')

  // Seed cron telemetry settings
  await prisma.cronTelemetrySettings.upsert({
    where: { tenantId: defaultTenant.id },
    update: {
      performance: { slowQueryThreshold: 500, sampleRate: 0.2 },
      reliability: { maxRetries: 3, backoffMultiplier: 2 },
      monitoring: { alerting: true, dashboardEnabled: true },
      scheduling: { timezone: 'UTC', batchSize: 100 },
    },
    create: {
      tenantId: defaultTenant.id,
      performance: { slowQueryThreshold: 500, sampleRate: 0.2 },
      reliability: { maxRetries: 3, backoffMultiplier: 2 },
      monitoring: { alerting: true, dashboardEnabled: true },
      scheduling: { timezone: 'UTC', batchSize: 100 },
    },
  })

  console.log('✅ Cron telemetry settings created')

  console.log('🎉 Enhanced seed completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log(`SUPER_ADMIN: superadmin@accountingfirm.com / ${superadminPlain}`)
  console.log(`Admin: admin@accountingfirm.com / ${adminPlain}`)
  console.log(`Staff: staff@accountingfirm.com / ${staffPlain}`)
  console.log(`Client 1: client1@example.com / ${clientPlain}`)
  console.log(`Client 2: client2@example.com / ${clientPlain}`)
  console.log(`Lead: lead@accountingfirm.com / ${leadPlain}`)
}

export async function runSeed() {
  return main()
}

if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e: unknown) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })
}
