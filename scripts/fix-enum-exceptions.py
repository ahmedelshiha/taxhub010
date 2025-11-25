#!/usr/bin/env python3
"""
Fix CREATE TYPE exception handlers to use duplicate_object instead of duplicate_table
"""
import re
from pathlib import Path

migration_file = Path("c:/Users/User/taxhub003/prisma/migrations/20251122170506_init/migration.sql")

print(f"📄 Reading migration file...")
content = migration_file.read_text(encoding='utf-8')

# Count CREATE TYPE blocks before
create_type_blocks = len(re.findall(r'-- CreateEnum\s+DO \$\$ BEGIN\s+CREATE TYPE', content, re.IGNORECASE))
print(f"📊 Found {create_type_blocks} CREATE TYPE blocks")

# Count wrong exception handlers
wrong_handlers = len(re.findall(r'CREATE TYPE[^;]+;\s+EXCEPTION\s+WHEN duplicate_table THEN null;', content, re.DOTALL))
print(f"❌ Using duplicate_table (wrong): {wrong_handlers}")

# Fix: Replace duplicate_table with duplicate_object for CREATE TYPE blocks only
# We need to be careful to only change CREATE TYPE blocks, not CREATE TABLE or CREATE INDEX

lines = content.split('\n')
result = []
in_create_type_block = False

for i, line in enumerate(lines):
    if '-- CreateEnum' in line:
        in_create_type_block = True
    elif 'END $$;' in line and in_create_type_block:
        in_create_type_block = False
   
    # Replace duplicate_table with duplicate_object in ENUM blocks
    if in_create_type_block and 'WHEN duplicate_table THEN null;' in line:
        line = line.replace('WHEN duplicate_table THEN null;', 'WHEN duplicate_object THEN null;')
        print(f"   Fixed line {i+1}")
    
    result.append(line)

new_content = '\n'.join(result)

# Verify the fix
correct_handlers = len(re.findall(r'CREATE TYPE[^;]+;\s+EXCEPTION\s+WHEN duplicate_object THEN null;', new_content, re.DOTALL))
remaining_wrong = len(re.findall(r'CREATE TYPE[^;]+;\s+EXCEPTION\s+WHEN duplicate_table THEN null;', new_content, re.DOTALL))

print(f"\n✅ After fix:")
print(f"   Using duplicate_object (correct): {correct_handlers}")
print(f"   Using duplicate_table (wrong): {remaining_wrong}")

if remaining_wrong == 0:
    print(f"\n💾 Writing fixed migration file...")
    migration_file.write_text(new_content, encoding='utf-8')
    print(f"🎉 All CREATE TYPE exception handlers fixed!")
else:
    print(f"\n❌ Still have {remaining_wrong} wrong handlers, not writing")
