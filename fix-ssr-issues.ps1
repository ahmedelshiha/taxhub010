# SSR Safety Fixes - Automated Script
# Adds typeof window checks to prevent SSR crashes

Write-Host "Starting SSR Safety Fixes..." -ForegroundColor Green

# Track changes
$filesFixed = @()
$errors = @()

# Function to add SSR guard to a file
function Add-SSRGuard {
    param(
        [string]$FilePath,
        [string]$SearchPattern,
        [string]$ReplacePattern
    )
    
    try {
        if (Test-Path $FilePath) {
            $content = Get-Content $FilePath -Raw
            if ($content -match [regex]::Escape($SearchPattern)) {
                $newContent = $content -replace [regex]::Escape($SearchPattern), $ReplacePattern
                Set-Content -Path $FilePath -Value $newContent -NoNewline
                return $true
            } else {
                Write-Host "  ⚠ Pattern not found in $FilePath" -ForegroundColor Yellow
                return $false
            }
        } else {
            Write-Host "  ❌ File not found: $FilePath" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ❌ Error processing $FilePath : $_" -ForegroundColor Red
        $script:errors += $FilePath
        return $false
    }
}

Write-Host "`n1. Fixing PortalHeader.tsx..." -ForegroundColor Cyan
$file = "src\components\portal\layout\PortalHeader.tsx"
$search = @"
  // Cmd+K / Ctrl+K shortcut for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
"@
$replace = @"
  // Cmd+K / Ctrl+K shortcut for global search
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleKeyDown = (e: KeyboardEvent) => {
"@
if (Add-SSRGuard $file $search $replace) {
    $filesFixed += $file
    Write-Host "  ✅ Fixed PortalHeader.tsx" -ForegroundColor Green
}

Write-Host "`n2. Fixing DropZone.tsx..." -ForegroundColor Cyan
$file = "src\components\portal\shared\DropZone.tsx"
$search = @"
    // Optional: Allow paste from clipboard
    useEffect(() => {
        if (!onFilesAccepted) return

        const handlePaste = (e: ClipboardEvent) => {
"@
$replace = @"
    // Optional: Allow paste from clipboard
    useEffect(() => {
        if (!onFilesAccepted || typeof window === 'undefined') return

        const handlePaste = (e: ClipboardEvent) => {
"@
if (Add-SSRGuard $file $search $replace) {
    $filesFixed += $file
    Write-Host "  ✅ Fixed DropZone.tsx" -ForegroundColor Green
}

Write-Host "`n3. Fixing LiveChatWidget.tsx - Part 1 (localStorage in useEffect)..." -ForegroundColor Cyan
$file = "src\components\portal\LiveChatWidget.tsx"
$search = @"
  // Flush pending queue on reconnect
  useEffect(() => {
    const onOnline = async () => {
"@
$replace = @"
  // Flush pending queue on reconnect
  useEffect(() => {
    if (typeof window === 'undefined') return

    const onOnline = async () => {
"@
if (Add-SSRGuard $file $search $replace) {
    Write-Host "  ✅ Fixed LiveChatWidget.tsx (Part 1)" -ForegroundColor Green
}

Write-Host "`n4. Fixing LiveChatWidget.tsx - Part 2 (queueMessage function)..." -ForegroundColor Cyan
$search = @"
  const queueMessage = (msg: string) => {
    if (navigator.onLine) return
    try {
"@
$replace = @"
  const queueMessage = (msg: string) => {
    if (navigator.onLine || typeof window === 'undefined') return
    try {
"@
if (Add-SSRGuard $file $search $replace) {
    $filesFixed += $file
    Write-Host "  ✅ Fixed LiveChatWidget.tsx (Part 2)" -ForegroundColor Green
}

Write-Host "`n5. Fixing GlobalSearchModal.tsx - Part 1 (localStorage load)..." -ForegroundColor Cyan
$file = "src\components\portal\GlobalSearchModal.tsx"
$search = @"
    // Load recent searches from localStorage
    useEffect(() => {
        if (!open) return
        try {
"@
$replace = @"
    // Load recent searches from localStorage
    useEffect(() => {
        if (!open || typeof window === 'undefined') return
        try {
"@
if (Add-SSRGuard $file $search $replace) {
    Write-Host "  ✅ Fixed GlobalSearchModal.tsx (Part 1)" -ForegroundColor Green
}

Write-Host "`n6. Fixing GlobalSearchModal.tsx - Part 2 (saveRecentSearch)..." -ForegroundColor Cyan
$search = @"
    const saveRecentSearch = (result: SearchResult) => {
        const updated = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, MAX_RECENT_SEARCHES)
        setRecentSearches(updated)
        try {
"@
$replace = @"
    const saveRecentSearch = (result: SearchResult) => {
        const updated = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, MAX_RECENT_SEARCHES)
        setRecentSearches(updated)
        if (typeof window !== 'undefined') {
            try {
"@
if (Add-SSRGuard $file $search $replace) {
    Write-Host "  ✅ Fixed GlobalSearchModal.tsx (Part 2)" -ForegroundColor Green
}

Write-Host "`n7. Fixing GlobalSearchModal.tsx - Part 3 (keyboard shortcut)..." -ForegroundColor Cyan
$search = @"
    // Keyboard navigation
    useEffect(() => {
        if (!open) return

        const handleKeyDown = (e: KeyboardEvent) => {
"@
$replace = @"
    // Keyboard navigation
    useEffect(() => {
        if (!open || typeof window === 'undefined') return

        const handleKeyDown = (e: KeyboardEvent) => {
"@
if (Add-SSRGuard $file $search $replace) {
    Write-Host "  ✅ Fixed GlobalSearchModal.tsx (Part 3)" -ForegroundColor Green
}

Write-Host "`n8. Fixing GlobalSearchModal.tsx - Part 4 (clearRecent)..." -ForegroundColor Cyan
$search = @"
    const handleClearRecent = () => {
        setRecentSearches([])
        try {
"@
$replace = @"
    const handleClearRecent = () => {
        setRecentSearches([])
        if (typeof window !== 'undefined') {
            try {
"@
if (Add-SSRGuard $file $search $replace) {
    $filesFixed += $file
    Write-Host "  ✅ Fixed GlobalSearchModal.tsx (Part 4)" -ForegroundColor Green
}

# Summary
Write-Host "`n" + ("="*60) -ForegroundColor Magenta
Write-Host "SUMMARY" -ForegroundColor Magenta
Write-Host ("="*60) -ForegroundColor Magenta

Write-Host "`nFiles Fixed:" -ForegroundColor Green
$uniqueFiles = $filesFixed | Select-Object -Unique
foreach ($f in $uniqueFiles) {
    Write-Host "  ✅ $f" -ForegroundColor Green
}

if ($errors.Count -gt 0) {
    Write-Host "`nErrors:" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host "  ❌ $e" -ForegroundColor Red
    }
}

Write-Host "`nTotal Files Modified: $($uniqueFiles.Count)" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "`n✅ ALL FIXES APPLIED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "  1. Review changes: git diff" -ForegroundColor White
    Write-Host "  2. Test the portal: pnpm dev" -ForegroundColor White
    Write-Host "  3. Commit if working: git add . && git commit -m 'fix: add SSR safety guards'" -ForegroundColor White
} else {
    Write-Host "`n⚠ COMPLETED WITH ERRORS - Please review" -ForegroundColor Yellow
}
