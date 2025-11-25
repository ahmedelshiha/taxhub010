#!/usr/bin/env python3
"""
Comprehensive script to make Prisma migration SQL idempotent by wrapping:
- CREATE TABLE statements 
- CREATE INDEX statements
- CREATE UNIQUE INDEX statements
in DO blocks with exception handling.
"""

import re
import sys
from pathlib import Path


def wrap_create_statements_in_do_blocks(sql_content: str) -> tuple[str, dict]:
    """
    Wrap CREATE TABLE and CREATE INDEX statements in DO blocks with exception handling.
    
    Returns:
        Tuple of (modified content, stats dict)
    """
    
    lines = sql_content.split('\n')
    result_lines = []
    i = 0
    
    stats = {
        'create_table_wrapped': 0,
        'create_index_wrapped': 0,
        'create_unique_index_wrapped': 0
    }
    
    while i < len(lines):
        line = lines[i]
        
        # Check for CREATE TABLE
        if re.match(r'^CREATE TABLE\s+"[^"]+"', line):
            prev_meaningful_idx = i - 1
            while prev_meaningful_idx >= 0 and not lines[prev_meaningful_idx].strip():
                prev_meaningful_idx -= 1
            
            is_already_wrapped = (
                prev_meaningful_idx >= 0 and 
                'DO $$ BEGIN' in lines[prev_meaningful_idx]
            )
            
            if not is_already_wrapped:
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
                    result_lines.append('DO $$ BEGIN')
                    for tline in table_lines:
                        result_lines.append('    ' + tline if tline.strip() else tline)
                    result_lines.append('EXCEPTION')
                    result_lines.append('    WHEN duplicate_table THEN null;')
                    result_lines.append('END $$;')
                    stats['create_table_wrapped'] += 1
                    i = current_line
                    continue
        
        # Check for CREATE INDEX or CREATE UNIQUE INDEX
        index_match = re.match(r'^(CREATE (?:UNIQUE )?INDEX)\s+', line)
        if index_match:
            # Check if already wrapped
            prev_meaningful_idx = i - 1
            while prev_meaningful_idx >= 0 and not lines[prev_meaningful_idx].strip():
                prev_meaningful_idx -= 1
            
            is_already_wrapped = (
                prev_meaningful_idx >= 0 and 
                'DO $$ BEGIN' in lines[prev_meaningful_idx]
            )
            
            if not is_already_wrapped:
                # Index statements are typically single line ending with ;
                index_line = line
                if 'UNIQUE' in line:
                    stats['create_unique_index_wrapped'] += 1
                else:
                    stats['create_index_wrapped'] += 1
                
                # Keep the comment if it exists
                if i > 0 and lines[i-1].startswith('-- '):
                    result_lines.append(lines[i-1])
                
                result_lines.append('DO $$ BEGIN')
                result_lines.append('    ' + index_line)
                result_lines.append('EXCEPTION')
                result_lines.append('    WHEN duplicate_object THEN null;')
                result_lines.append('END $$;')
                i += 1
                continue
        
        result_lines.append(line)
        i += 1
    
    return '\n'.join(result_lines), stats


def main():
    migration_file = Path("c:/Users/User/taxhub003/prisma/migrations/20251122170506_init/migration.sql")
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        sys.exit(1)
    
    print(f"📄 Reading migration file: {migration_file}")
    content = migration_file.read_text(encoding='utf-8')
    
    # Count before
    create_table_count = len(re.findall(r'^CREATE TABLE\s+"[^"]+"', content, re.MULTILINE))
    create_index_count = len(re.findall(r'^CREATE INDEX\s+', content, re.MULTILINE))
    create_unique_index_count = len(re.findall(r'^CREATE UNIQUE INDEX\s+', content, re.MULTILINE))
    
    print(f"📊 Current state:")
    print(f"   CREATE TABLE: {create_table_count}")
    print(f"   CREATE INDEX: {create_index_count}")
    print(f"   CREATE UNIQUE INDEX: {create_unique_index_count}")
    
    print(f"🔧 Wrapping all CREATE statements in DO blocks...")
    new_content, stats = wrap_create_statements_in_do_blocks(content)
    
    print(f"✅ Wrapped:")
    print(f"   CREATE TABLE: {stats['create_table_wrapped']}")
    print(f"   CREATE INDEX: {stats['create_index_wrapped']}")
    print(f"   CREATE UNIQUE INDEX: {stats['create_unique_index_wrapped']}")
    print(f"   Total: {sum(stats.values())}")
    
    # Create backup if not already exists
    backup_file = migration_file.with_suffix('.sql.backup2')
    if not backup_file.exists():
        print(f"💾 Creating backup: {backup_file}")
        backup_file.write_text(content, encoding='utf-8')
    else:
        print(f"ℹ️  Backup already exists: {backup_file}")
    
    # Write new content
    print(f"✍️  Writing fixed migration file...")
    migration_file.write_text(new_content, encoding='utf-8')
    
    print(f"🎉 Migration file fixed successfully!")
    print(f"   All CREATE statements are now idempotent!")


if __name__ == "__main__":
    main()
