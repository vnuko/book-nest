# Change Request: Theme Colors to Dark Mode

## Context
Transform the application from a light theme to a dark theme based on the BookSpot template design.

## Reference
`frontend/template/index.html` - lines 21-26 (body styles)

## Target Files
- `frontend/src/styles/variables.css`

## Changes Required

### Update CSS Variables in `variables.css`

Replace the current light theme variables with dark theme:

```css
:root {
  --bn-bg: #000000;
  --bn-bg-gradient: linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%);
  --bn-sidebar: #000000;
  --bn-accent: #ffffff;
  --bn-accent-light: rgba(255, 255, 255, 0.1);
  --bn-text: #ffffff;
  --bn-text-secondary: #999999;
  --bn-text-muted: #666666;
  --bn-border: rgba(255, 255, 255, 0.1);
  --bn-border-light: rgba(255, 255, 255, 0.05);

  --bn-shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.5);
  --bn-shadow-hover: 0 12px 32px rgba(0, 0, 0, 0.6);

  --bn-radius: 8px;
  --bn-radius-sm: 8px;
  --bn-radius-lg: 50px;

  --bn-sidebar-width: 260px;
  --bn-topbar-height: 0px;

  --bn-transition-fast: 150ms ease;
  --bn-transition-normal: 300ms ease;
  --bn-transition-slow: 400ms ease;
}
```

## Visual Outcome
- Pure black background with subtle gradient
- White text on dark backgrounds
- Subtle white transparent borders (10% opacity)
- Larger border radius for buttons/search (pill shape)
- Wider sidebar (260px vs 220px)
- Darker, more pronounced shadows
