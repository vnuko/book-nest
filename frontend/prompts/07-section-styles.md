# Change Request: Section and Typography Styles

## Context
Update section headers and typography to match the dark template.

## Reference
`frontend/template/index.html` - lines 163-189

## Target Files
- `frontend/src/components/sections/HorizontalScroll/HorizontalScroll.module.css`
- `frontend/src/pages/OverviewPage/OverviewPage.module.css`

## Changes Required

### HorizontalScroll Section Styles

```css
.container {
  margin-bottom: 64px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: var(--bn-text);
  margin-bottom: 0;
}

.seeMore {
  font-size: 14px;
  font-weight: 500;
  color: var(--bn-text-secondary);
  cursor: pointer;
  transition: color var(--bn-transition-fast);
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
}

.seeMore:hover {
  color: var(--bn-text);
}
```

### Overview Page Header

Add section header styling for the main welcome area:

```css
.sectionHeader {
  margin-bottom: 32px;
}

.sectionTitle {
  font-size: 42px;
  font-weight: bold;
  color: var(--bn-text);
  margin-bottom: 8px;
}

.sectionSubtitle {
  font-size: 16px;
  color: var(--bn-text-secondary);
}

@media (max-width: 768px) {
  .sectionTitle {
    font-size: 32px;
  }
  
  .title {
    font-size: 24px;
  }
}
```

## Visual Outcome
- Larger, bolder section titles
- Consistent margin spacing (64px between sections)
- Subtitle in muted gray
- Responsive font sizes
