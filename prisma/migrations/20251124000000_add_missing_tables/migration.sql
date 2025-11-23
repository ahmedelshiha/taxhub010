-- CreateTable (Idempotent)
-- This migration adds tables that exist in schema.prisma but were missing from the init migration

DO $$ BEGIN
    CREATE TABLE "Task" (
        "id" TEXT NOT NULL,
        "tenantId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "dueAt" TIMESTAMP(3),
        "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
        "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
        "assigneeId" TEXT,
        "createdById" TEXT,
        "complianceRequired" BOOLEAN NOT NULL DEFAULT false,
        "complianceDeadline" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "completedAt" TIMESTAMP(3),
        "clientId" TEXT,
        "bookingId" TEXT,

        CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
    );
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- CreateIndex (Idempotent)
DO $$ BEGIN
    CREATE INDEX "Task_tenantId_idx" ON "Task"("tenantId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Task_tenantId_status_idx" ON "Task"("tenantId", "status");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Task_tenantId_dueAt_idx" ON "Task"("tenantId", "dueAt");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Task_tenantId_createdAt_idx" ON "Task"("tenantId", "createdAt");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Task_tenantId_assigneeId_idx" ON "Task"("tenantId", "assigneeId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Task_tenantId_status_dueAt_idx" ON "Task"("tenantId", "status", "dueAt");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Task_clientId_idx" ON "Task"("clientId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Task_bookingId_idx" ON "Task"("bookingId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- AddForeignKey (Idempotent - will fail silently if already exists)
DO $$ BEGIN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
