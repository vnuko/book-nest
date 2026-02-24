# Change Request: Author Cards Dark Theme

## Context
Update author card styling to match the dark template with circular photos.

## Reference
`frontend/template/index.html` - lines 316-383

## Target Files
- `frontend/src/pages/AuthorsPage/AuthorsPage.module.css`
- May need new component: `frontend/src/components/cards/AuthorCard/AuthorCard.module.css`

## Changes Required

### Author Card Styles

```css
.card {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 8px;
  transition: all var(--bn-transition-normal);
  cursor: pointer;
  text-align: center;
  height: 100%;
}

.card:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.photoWrapper {
  margin-bottom: 20px;
}

.photo {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  border: 4px solid rgba(255, 255, 255, 0.1);
  transition: all var(--bn-transition-normal);
  margin: 0 auto;
}

.card:hover .photo {
  border-color: rgba(255, 255, 255, 0.2);
}

.name {
  font-size: 20px;
  font-weight: 600;
  color: var(--bn-text);
  margin-bottom: 8px;
}

.booksCount {
  font-size: 14px;
  color: var(--bn-text-secondary);
  margin-bottom: 12px;
}

.followBtn {
  padding: 10px 28px;
  background-color: #ffffff;
  color: #000000;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.followBtn:hover {
  transform: scale(1.05);
}
```

### Grid Layout for Authors Page

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
}
```

## Notes for TSX Updates
The author card component may need:
1. Circular photo with border styling
2. Centered text layout
3. Follow button at bottom

## Visual Outcome
- Centered card layout with circular author photo
- Border on photo that changes on hover
- Book count and follow button
- Hover lift effect
