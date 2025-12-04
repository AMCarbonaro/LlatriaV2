# Missing Features in Mobile App UI

## Problem
The mobile app **stores** exist and have all the data/logic, but the **UI doesn't expose the features**. The mobile inventory screen is very basic while desktop has a full-featured interface.

## Stores Status
✅ All stores exist on mobile:
- `historyStore.ts` ✅
- `draftStore.ts` ✅
- `listingStore.ts` ✅
- `toastStore.ts` ✅
- `inventoryStore.ts` ✅ (has all fields and methods)

## Missing UI Features in Mobile

### 1. Search Bar ❌
- Desktop: Has `SearchBar` component in sidebar
- Mobile: No search input at all

### 2. Filters ❌
- Desktop: Has `InventorySidebar` with:
  - Status filter (All, Active, Sold)
  - Platform filter (Facebook, eBay, Website)
  - Category filter (dropdown + multi-select)
  - Advanced filters (date range, price range)
- Mobile: No filters at all

### 3. Sorting ❌
- Desktop: Has `SortAndViewOptions` component
  - Sort by: Date, Price, Name, Status, Category
  - Sort order: Ascending, Descending
- Mobile: No sorting UI (hardcoded date sort)

### 4. View Mode Toggle ❌
- Desktop: Grid/List view toggle
- Mobile: Only list view (no grid option)

### 5. Bulk Operations ❌
- Desktop: Has `BulkActionsBar`
  - Select multiple items
  - Bulk delete
  - Bulk mark as sold
- Mobile: No bulk operations

### 6. Advanced Filters ❌
- Desktop: Has `AdvancedFilters` component
  - Date range picker
  - Price range (min/max)
  - Multiple category selection
- Mobile: None

### 7. Export/Import ❌
- Desktop: Export to CSV/JSON, Import from CSV/JSON
- Mobile: None

### 8. Undo/Redo ❌
- Desktop: Undo/Redo buttons with keyboard shortcuts
- Mobile: None (store exists but no UI)

### 9. Toast Notifications ❌
- Desktop: Toast notifications for all actions
- Mobile: Store exists but no toast UI component

## What Needs to Be Created

### High Priority - Core Features:
1. **SearchBar Component** - Mobile-friendly search input
2. **Filter Sheet/Modal** - Mobile filter interface (can be bottom sheet or modal)
3. **Sort Options** - Dropdown or modal for sorting
4. **View Mode Toggle** - Grid/List toggle button
5. **Toast Component** - Toast notifications UI

### Medium Priority - Enhanced Features:
6. **Bulk Selection Mode** - Enable multi-select on inventory items
7. **Bulk Actions Bar** - Mobile-friendly bulk actions
8. **Advanced Filters Modal** - Date range, price range pickers
9. **Grid View Component** - Grid layout for inventory items

### Low Priority:
10. **Export/Import** - Share sheet for export, file picker for import

## Current Mobile Inventory Screen
Currently just shows:
- Simple FlatList of items
- Item image, title, price, category
- Platform icons (now fixed to show only posted)
- Status badges
- Pull to refresh

## Action Items
1. Create mobile UI components that match desktop functionality
2. Adapt desktop components for mobile touch interface
3. Use mobile-friendly patterns (modals, bottom sheets, etc.)
4. Ensure all store methods are accessible via UI



