#!/usr/bin/env python3
"""
Make the fresh migration idempotent by wrapping all CREATE statements in DO blocks
"""
import re
from pathlib import Path

migrations_dir = Path("c:/Users/User/taxhub003/prisma/migrations")
# Find the latest migration folder
migration_dirs = [d for d in migrations_dir.iterdir() if d.is_dir() and d.name.startswith("2025")]
if not migration_dirs:
    print("❌ No migration directory found!")
    exit(1)

# Sort by name (timestamp) and pick the last one
latest_migration_dir = sorted(migration_dirs, key=lambda d: d.name)[-1]
migration_file = latest_migration_dir / "migration.sql"

print(f"📄 Reading fresh migration file...")
content = migration_file.read_text(encoding='utf-8')

# Count statements before
create_tables = len(re.findall(r'^CREATE TABLE', content, re.MULTILINE))
create_indexes = len(re.findall(r'^CREATE (?:UNIQUE )?INDEX', content, re.MULTILINE))
create_types = len(re.findall(r'^CREATE TYPE', content, re.MULTILINE))

print(f"📊 Found:")
print(f"   - {create_tables} CREATE TABLE statements")
print(f"   - {create_indexes} CREATE INDEX statements")  
print(f"   - {create_types} CREATE TYPE statements")

# Fix CREATE TYPE statements (use duplicate_object)
content = re.sub(
    r'(CREATE TYPE "[^"]+" AS ENUM \([^)]+\);)',
    r'DO $$ BEGIN\n    \1\nEXCEPTION\n    WHEN duplicate_object THEN null;\nEND $$;',
    content
)

# Fix CREATE TABLE statements (use duplicate_table)
content = re.sub(
    r'(CREATE TABLE "[^"]+"[^;]+;)',
    r'DO $$ BEGIN\n    \1\nEXCEPTION\n    WHEN duplicate_table THEN null;\nEND $$;',
    content,
    flags=re.DOTALL
)

# Fix CREATE INDEX statements (use duplicate_table)
content = re.sub(
    r'(CREATE (?:UNIQUE )?INDEX "[^"]+" ON "[^"]+"\([^)]+\);)',
    r'DO $$ BEGIN\n    \1\nEXCEPTION\n    WHEN duplicate_table THEN null;\nEND $$;',
    content
)

# Fix ALTER TABLE ADD CONSTRAINT (foreign keys - use duplicate_object)
content = re.sub(
    r'(ALTER TABLE "[^"]+" ADD CONSTRAINT "[^"]+" FOREIGN KEY[^;]+;)',
    r'DO $$ BEGIN\n    \1\nEXCEPTION\n    WHEN duplicate_object THEN null;\nEND $$;',
    content
)

print(f"\n💾 Writing idempotent migration...")
migration_file.write_text(content, encoding='utf-8')

print(f"🎉 Migration is now fully idempotent!")
print(f"✅ Safe to run multiple times without errors")
