# Change Request: Sidebar Dark Theme Styling

## Context
Update the sidebar component to match the dark template design with new styling.

## Reference
`frontend/template/index.html` - lines 34-110

## Target Files
- `frontend/src/components/common/Sidebar/Sidebar.module.css`

## Changes Required

### Update `Sidebar.module.css`

1. **Overlay** - Darker overlay:
```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  z-index: 1040;
  transition: opacity var(--bn-transition-normal), visibility var(--bn-transition-normal);
}
```

2. **Sidebar container** - Update padding and remove top offset:
```css
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--bn-sidebar-width);
  background: var(--bn-sidebar);
  border-right: 1px solid var(--bn-border);
  padding: 32px 24px;
  z-index: 1050;
  transition: transform var(--bn-transition-slow);
  display: flex;
  flex-direction: column;
}
```

3. **Logo section** - Add at top of sidebar:
```css
.logo {
  margin-bottom: 40px;
}

.logo h1 {
  font-size: 32px;
  font-weight: bold;
  color: var(--bn-text);
  margin-bottom: 8px;
}

.logo p {
  font-size: 14px;
  color: var(--bn-text-secondary);
}
```

4. **Nav items** - Rounded with hover effects:
```css
.navItem {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  color: var(--bn-text-secondary);
  font-weight: 500;
  font-size: 16px;
  transition: all var(--bn-transition-normal);
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.navItem svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.navItem:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--bn-text);
}

.navItem.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--bn-text);
}

.navItem.active::before {
  display: none;
}
```

5. **Sidebar footer** - Add at bottom:
```css
.sidebarFooter {
  padding-top: 24px;
  border-top: 1px solid var(--bn-border);
  margin-top: auto;
}

.sidebarFooter p {
  font-size: 12px;
  color: #666666;
}
```

6. **Mobile styles**:
```css
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: var(--bn-shadow-hover);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
```

## Visual Outcome
- Sidebar starts from top (no topbar offset)
- Logo area at top with title and subtitle
- Darker nav item backgrounds on hover
- Footer at bottom with copyright
- Smoother transitions
