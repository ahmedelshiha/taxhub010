#!/usr/bin/env python3
"""
Remove orphaned Task-related CREATE INDEX statements from init migration.
These indexes reference a Task table that doesn't exist in the init migration.
"""
from pathlib import Path
import re

migration_file = Path("c:/Users/User/taxhub003/prisma/migrations/20251122170506_init/migration.sql")

print(f"📄 Reading migration file...")
content = migration_file.read_text(encoding='utf-8')

# Patterns to remove - Task indexes that reference non-existent table
task_patterns = [
    r'-- CreateIndex\r?\n--? CreateIndex\r?\nDO \$\$ BEGIN\r?\n    CREATE INDEX "Task_tenantId_idx".*?END \$\$;\r?\n',
    r'-- CreateIndex\r?\n--? CreateIndex\r?\nDO \$\$ BEGIN\r?\n    CREATE INDEX "Task_tenantId_status_idx".*?END \$\$;\r?\n',
    r'-- CreateIndex\r?\n--? CreateIndex\r?\nDO \$\$ BEGIN\r?\n    CREATE INDEX "Task_tenantId_dueAt_idx".*?END \$\$;\r?\n',
    r'-- CreateIndex\r?\n--? CreateIndex\r?\nDO \$\$ BEGIN\r?\n    CREATE INDEX "Task_tenantId_createdAt_idx".*?END \$\$;\r?\n',
    r'-- CreateIndex\r?\n--? CreateIndex\r?\nDO \$\$ BEGIN\r?\n    CREATE INDEX "Task_tenantId_assigneeId_idx".*?END \$\$;\r?\n',
    r'-- CreateIndex\r?\n--? CreateIndex\r?\nDO \$\$ BEGIN\r?\n    CREATE INDEX "Task_tenantId_status_dueAt_idx".*?END \$\$;\r?\n',
    r'-- CreateIndex\r?\n--? CreateIndex\r?\nDO \$\$ BEGIN\r?\n    CREATE INDEX "Task_clientId_idx".*?END \$\$;\r?\n',
    r'-- CreateIndex\r?\n--? CreateIndex\r?\nDO \$\$ BEGIN\r?\n    CREATE INDEX "Task_bookingId_idx".*?END \$\$;\r?\n',
]

removed_count = 0
for pattern in task_patterns:
    matches = re.findall(pattern, content, re.DOTALL)
    if matches:
        removed_count += len(matches)
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        print(f"   Removed Task index: {len(matches)} occurrence(s)")

print(f"\n✅ Removed {removed_count} Task-related CREATE INDEX statements")

# Save the modified content
print(f"💾 Writing updated migration file...")
migration_file.write_text(content, encoding='utf-8')

print(f"🎉 Migration file updated successfully!")
