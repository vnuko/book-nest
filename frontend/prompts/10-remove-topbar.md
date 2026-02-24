# Change Request: Remove TopBar Component

## Context
The template design uses a sidebar-only layout without a top navigation bar. The logo and navigation are all in the sidebar.

## Reference
`frontend/template/index.html` - sidebar contains logo, no separate topbar

## Target Files
- `frontend/src/components/common/Layout/Layout.tsx`
- Optionally hide/remove: `frontend/src/components/common/TopBar/*`

## Changes Required

### Update `Layout.tsx`

Remove the TopBar import and usage:

```tsx
import { useState, useCallback } from 'react';
import { Sidebar } from '../Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} onMenuClick={toggleSidebar} />
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </>
  );
}
```

### Sidebar Updates
Add hamburger menu toggle to Sidebar for mobile:
- The Sidebar needs a hamburger menu button visible on mobile to open/close the sidebar
- This can be a menu icon at the top of the sidebar when collapsed on mobile

## Visual Outcome
- No top navigation bar
- All navigation (including logo) in the sidebar
- Mobile: hamburger button in sidebar to toggle visibility
- Cleaner, more focused layout
