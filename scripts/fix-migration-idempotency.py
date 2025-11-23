#!/usr/bin/env python3
"""
Script to make Prisma migration SQL idempotent by wrapping CREATE TABLE statements
in DO blocks with exception handling.
"""

import re
import sys
from pathlib import Path


def wrap_create_table_in_do_block(sql_content: str) -> str:
    """
    Wrap CREATE TABLE statements in DO blocks with exception handling.
    
    Pattern to match:
        CREATE TABLE "table_name" (
            ...
        );
    
    Replace with:
        DO $$ BEGIN
            CREATE TABLE "table_name" (
                ...
            );
        EXCEPTION
            WHEN duplicate_table THEN null;
        END $$;
    """
    
    # Pattern to match CREATE TABLE statements that are NOT already in DO blocks
    # We look for CREATE TABLE followed by content until closing );
    # But we need to ensure it's not already wrapped in DO $$ BEGIN
    
    lines = sql_content.split('\n')
    result_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if this is a CREATE TABLE line (not in a DO block)
        if re.match(r'^CREATE TABLE\s+"[^"]+"', line):
            # Check if previous non-empty line is DO $$ BEGIN
            prev_meaningful_idx = i - 1
            while prev_meaningful_idx >= 0 and not lines[prev_meaningful_idx].strip():
                prev_meaningful_idx -= 1
            
            is_already_wrapped = (
                prev_meaningful_idx >= 0 and 
                'DO $$ BEGIN' in lines[prev_meaningful_idx]
            )
            
            if not is_already_wrapped:
                # Find the end of the CREATE TABLE statement (closing );)
                table_lines = []
                current_line = i
                found_end = False
                
                while current_line < len(lines):
                    table_lines.append(lines[current_line])
                    if re.search(r'\);$', lines[current_line]):
                        found_end = True
                        current_line += 1
                        break
                    current_line += 1
                
                if found_end:
                    # Wrap in DO BLOCK
                    # Keep the comment if it exists
                    if i > 0 and lines[i-1].startswith('-- '):
                        result_lines.append(lines[i-1])
                        result_lines.append('DO $$ BEGIN')
                        # Indent the table creation
                        for tline in table_lines:
                            result_lines.append('    ' + tline if tline.strip() else tline)
                        result_lines.append('EXCEPTION')
                        result_lines.append('    WHEN duplicate_table THEN null;')
                        result_lines.append('END $$;')
                        
                        # Skip to after the table
                        i = current_line
                        continue
                    else:
                        result_lines.append('DO $$ BEGIN')
                        # Indent the table creation
                        for tline in table_lines:
                            result_lines.append('    ' + tline if tline.strip() else tline)
                        result_lines.append('EXCEPTION')
                        result_lines.append('    WHEN duplicate_table THEN null;')
                        result_lines.append('END $$;')
                        
                        # Skip to after the table
                        i = current_line
                        continue
        
        result_lines.append(line)
        i += 1
    
    return '\n'.join(result_lines)


def main():
    migration_file = Path("c:/Users/User/taxhub003/prisma/migrations/20251122170506_init/migration.sql")
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        sys.exit(1)
    
    print(f"📄 Reading migration file: {migration_file}")
    content = migration_file.read_text(encoding='utf-8')
    
    # Count CREATE TABLE statements before
    create_table_count = len(re.findall(r'^CREATE TABLE\s+"[^"]+"', content, re.MULTILINE))
    wrapped_count = len(re.findall(r'DO \$\$ BEGIN\s+CREATE TABLE', content, re.MULTILINE | re.DOTALL))
    
    print(f"📊 Found {create_table_count} CREATE TABLE statements")
    print(f"📊 Already wrapped: {wrapped_count}")
    print(f"📊 Need to wrap: {create_table_count - wrapped_count}")
    
    print(f"🔧 Wrapping CREATE TABLE statements in DO blocks...")
    new_content = wrap_create_table_in_do_block(content)
    
    # Count after
    new_create_table_count = len(re.findall(r'^CREATE TABLE\s+"[^"]+"', new_content, re.MULTILINE))
    new_wrapped_count = len(re.findall(r'DO \$\$ BEGIN\s+CREATE TABLE', new_content, re.MULTILINE | re.DOTALL))
    
    print(f"✅ After transformation:")
    print(f"   CREATE TABLE statements: {new_create_table_count}")
    print(f"   Wrapped statements: {new_wrapped_count}")
    
    # Create backup
    backup_file = migration_file.with_suffix('.sql.backup')
    print(f"💾 Creating backup: {backup_file}")
    migration_file.rename(backup_file)
    
    # Write new content
    print(f"✍️  Writing fixed migration file...")
    migration_file.write_text(new_content, encoding='utf-8')
    
    print(f"🎉 Migration file fixed successfully!")
    print(f"   Backup saved to: {backup_file}")
    print(f"   Fixed {new_wrapped_count - wrapped_count} CREATE TABLE statements")


if __name__ == "__main__":
    main()
