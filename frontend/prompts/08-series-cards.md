# Change Request: Series Cards Dark Theme

## Context
Update series card styling to match the book card dark theme.

## Reference
`frontend/template/index.html` - lines 191-314 (similar to book cards)

## Target Files
- `frontend/src/components/cards/SeriesCard/SeriesCard.module.css`

## Changes Required

### Update `SeriesCard.module.css`

```css
.card {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
  transition: all var(--bn-transition-normal);
  cursor: pointer;
  height: 100%;
}

.card:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.coverWrapper {
  position: relative;
  margin-bottom: 16px;
  overflow: hidden;
}

.cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  border-radius: 0;
}

.overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--bn-transition-normal);
}

.card:hover .overlay {
  opacity: 1;
}

.collectionButton {
  width: 56px;
  height: 56px;
  background-color: #ffffff;
  color: #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.collectionButton:hover {
  transform: scale(1.1);
}

.info {
  padding: 0 4px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: var(--bn-text);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count {
  font-size: 14px;
  color: var(--bn-text-secondary);
}
```

## Notes for TSX Updates
The `SeriesCard.tsx` component may need to be updated to include:
1. A wrapper div `.coverWrapper` around the cover image
2. An overlay div `.overlay` inside the cover wrapper
3. A collection icon button inside the overlay

## Visual Outcome
- Semi-transparent card background matching book cards
- Hover effect with lift (translateY -4px)
- Cover image with shadow, no border radius
- Overlay with collection icon on hover
- Consistent styling with book cards
