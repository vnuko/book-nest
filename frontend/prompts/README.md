# Frontend Visual Redesign - Change Request Index

## Overview
This folder contains a series of prompts for applying the BookSpot dark theme styling from `frontend/template/index.html` to the main React frontend application.

## Prompts Execution Order

Execute these prompts in order for best results:

| # | File | Description |
|---|------|-------------|
| 01 | `01-theme-colors.md` | Update CSS variables to dark theme colors |
| 02 | `02-global-styles.md` | Update body background, scrollbar styles |
| 03 | `03-sidebar-styles.md` | Dark theme sidebar styling |
| 04 | `04-search-bar.md` | Pill-shaped search bar styling |
| 05 | `05-book-cards.md` | Dark book cards with hover overlay |
| 06 | `06-author-cards.md` | Circular photo author cards |
| 07 | `07-section-styles.md` | Typography and section headers |
| 08 | `08-series-cards.md` | Dark series cards styling |
| 09 | `09-layout-main-content.md` | Main content layout adjustments |
| 10 | `10-remove-topbar.md` | Remove TopBar component |
| 11 | `11-sidebar-logo.md` | Add logo and footer to sidebar |

## Key Design Changes

### Color Scheme
- **Background**: Black (#000000) with subtle gradient
- **Text**: White (#ffffff) primary, gray (#999999) secondary
- **Borders**: Semi-transparent white (rgba(255, 255, 255, 0.1))
- **Accent**: White buttons on dark background

### Layout
- **Sidebar**: 260px wide, black background, full height
- **No TopBar**: Logo moved to sidebar
- **Main Content**: 40px padding, starts at top

### Components
- **Search**: Pill-shaped (50px radius), centered, max 700px
- **Cards**: Semi-transparent background, hover lift effect
- **Book Covers**: No border radius, shadow only
- **Author Photos**: Circular with border

## Notes
- These changes are **visual only** - no functional changes
- Build on top of Bootstrap (already included)
- Keep existing React component structure
- Some TSX files may need minor updates to add wrapper elements
