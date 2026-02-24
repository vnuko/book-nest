# Change Request: Main Layout Content Area

## Context
Update the main content layout to remove topbar offset and adjust padding.

## Reference
`frontend/template/index.html` - lines 113-117

## Target Files
- `frontend/src/components/common/Layout/Layout.module.css`

## Changes Required

### Update `Layout.module.css`

```css
.main {
  margin-left: var(--bn-sidebar-width);
  margin-top: 0;
  min-height: 100vh;
  padding: 40px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .main {
    margin-left: 0;
    padding: 24px;
  }
}

.skipLink {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: var(--bn-accent);
  color: white;
  z-index: 9999;
  transition: top var(--bn-transition-fast);
}

.skipLink:focus {
  top: 0;
}
```

## Notes
- The topbar should be removed or hidden as the template uses a sidebar-only layout
- The `--bn-topbar-height` variable should be set to 0
- The main content now has padding instead of relying on topbar offset

## Visual Outcome
- Content starts at the top of the viewport
- 40px padding around the content area
- Sidebar remains fixed on the left
- Mobile removes left margin
