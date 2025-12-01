# Tasks Page Modal Integration Guide

## Quick Fix (15 minutes)

The modal components are ready and imported. You just need to replace Link components with modal triggers.

### File: `src/app/portal/tasks/page.tsx`

**✅ Already Done:**
- Modal imports added (line 6)
- Modal states added (lines 40-50)
- Handlers added (`handleTaskClick`, `handleTaskUpdate`)

**❌ Need to Change:**

#### 1. Header "New Task" Button (Line ~151)
**Replace:**
```typescript
<Link href="/portal/tasks/new">
  <Button>
    <Plus className="w-4 h-4 mr-2" />
    New Task
  </Button>
</Link>
```

**With:**
```typescript
<Button onClick={() => setCreateModalOpen(true)}>
  <Plus className="w-4 h-4 mr-2" />
  New Task
</Button>
```

#### 2. Task Cards - All Tasks Tab (Line ~297-308)
**Replace:**
```typescript
{filteredTasks.map((task) => (
  <Link key={task.id} href={`/portal/tasks/${task.id}`}>
    <TaskCard
      data={task}
      variant="portal"
      onClick={() => { }}
      showActions={false}
    />
  </Link>
))}
```

**With:**
```typescript
{filteredTasks.map((task) => (
  <div
    key={task.id}
    onClick={() => handleTaskClick(task)}
    className="cursor-pointer"
  >
    <TaskCard
      data={task}
      variant="portal"
      onClick={() => handleTaskClick(task)}
      showActions={false}
    />
  </div>
))}
```

#### 3. Task Cards - Status Tabs (Line ~338-349)
**Same replacement as #2 above** for the status-based tabs mapping

#### 4. Empty State Button (Line ~363-367)
**Replace:**
```typescript
<Link href="/portal/tasks/new">
  <Button>Create First Task</Button>
</Link>
```

**With:**
```typescript
<Button onClick={() => setCreateModalOpen(true)}>
  Create First Task
</Button>
```

#### 5. Add Modals Before Closing `</div>` (Before line ~382)
**Add these three modal components:**
```typescript
      {/* Modals */}
      <TaskQuickCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleTaskUpdate}
      />

      <TaskDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onUpdate={handleTaskUpdate}
      />

      <TaskEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onSuccess={handleTaskUpdate}
      />
    </div>
  )
}
```

## Test After Changes
1. Click "New Task" button → Modal should open
2. Click on any task card → Detail modal should open
3. In detail modal, add a comment → Should work
4. Create a task → Should refresh and show new task

## Alternative: Use Modal from TaskCard
If you want to open the detail modal when clicking the entire card, the current approach works.
If you want a separate "View Details" button, you can add it to the TaskCard component later.

That's it! The modals are fully functional and ready to use.
