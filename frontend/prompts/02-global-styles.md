# Change Request: Global Styles Update

## Context
Update global body and scrollbar styles to match the dark theme template.

## Reference
`frontend/template/index.html` - lines 21-26, 385-401

## Target Files
- `frontend/src/styles/global.css`

## Changes Required

### Update `global.css`

1. **Body styles** - Add gradient background:
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%);
  color: var(--bn-text);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}
```

2. **Scrollbar styles** - Darker scrollbar:
```css
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

## Visual Outcome
- Subtle gradient background across the app
- Dark, semi-transparent scrollbars that match the theme
- Prevent horizontal scroll overflow
