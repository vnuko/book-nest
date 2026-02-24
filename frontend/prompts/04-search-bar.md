# Change Request: Search Bar Pill Style

## Context
Transform the search bar to a pill-shaped design with icon on the left.

## Reference
`frontend/template/index.html` - lines 119-161

## Target Files
- `frontend/src/components/common/SearchBar/SearchBar.module.css`

## Changes Required

### Update `SearchBar.module.css`

```css
.searchBar {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 18px 24px 18px 56px;
  margin-bottom: 48px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  transition: all var(--bn-transition-normal);
}

.searchBar:focus-within {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.searchBar svg {
  position: absolute;
  left: 20px;
  width: 20px;
  height: 20px;
  color: var(--bn-text-secondary);
  flex-shrink: 0;
}

.input {
  flex: 1;
  border: none;
  background: none;
  font-size: 16px;
  color: var(--bn-text);
  outline: none;
  font-family: inherit;
}

.input::placeholder {
  color: var(--bn-text-secondary);
}

.clearBtn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--bn-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--bn-transition-fast);
  opacity: 0;
  visibility: hidden;
}

.clearBtn.visible {
  opacity: 1;
  visibility: visible;
}

.clearBtn:hover {
  color: var(--bn-text);
}

.clearBtn svg {
  position: static;
  width: 16px;
  height: 16px;
}

@media (max-width: 480px) {
  .searchBar {
    padding: 14px 20px 14px 48px;
  }

  .searchBar svg {
    left: 16px;
  }
}
```

## Visual Outcome
- Pill-shaped (50px border-radius) search bar
- Centered with max-width of 700px
- Icon positioned absolutely on the left
- Subtle background and border
- Focus state with glow effect
- Larger padding for spacious feel
