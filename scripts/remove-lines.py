#!/usr/bin/env python3
"""
Remove lines 3685-3748 (Task indexes) from migration.sql
"""
from pathlib import Path

migration_file = Path("c:/Users/User/taxhub003/prisma/migrations/20251122170506_init/migration.sql")

print(f"📄 Reading migration file...")
lines = migration_file.read_text(encoding='utf-8').splitlines(keepends=True)

print(f"📊 Total lines: {len(lines)}")
print(f"🔪 Removing lines 3685-3748 (Task indexes)...")

# Remove lines 3685-3748 (0-indexed: 3684-3747)
before = lines[0:3684]
after = lines[3748:]
new_lines = before + after

print(f"✅ New total lines: {len(new_lines)}")
print(f"   Removed {len(lines) - len(new_lines)} lines")

print(f"💾 Writing updated migration file...")
migration_file.write_text(''.join(new_lines), encoding='utf-8')

print(f"🎉 Migration file updated successfully!")
