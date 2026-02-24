# Change Request: Add Logo to Sidebar

## Context
Add the logo and tagline to the sidebar, and a hamburger menu for mobile.

## Reference
`frontend/template/index.html` - lines 44-58, 101-110

## Target Files
- `frontend/src/components/common/Sidebar/Sidebar.tsx`
- `frontend/src/components/common/Sidebar/Sidebar.module.css`

## Changes Required

### Update `Sidebar.tsx`

Add logo section and footer:

```tsx
import { NavLink } from 'react-router-dom';
import { BiGridAlt, BiBook, BiUser, BiCollection } from 'react-icons/bi';
import { RxHamburgerMenu } from 'react-icons/rx';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', icon: BiGridAlt, label: 'Overview' },
  { to: '/authors', icon: BiUser, label: 'Authors' },
  { to: '/books', icon: BiBook, label: 'Books' },
  { to: '/series', icon: BiCollection, label: 'Series' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`} 
        onClick={onClose} 
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Mobile hamburger - only visible when sidebar is closed on mobile */}
        <button className={styles.hamburger} onClick={onClose}>
          <RxHamburgerMenu />
        </button>

        {/* Logo */}
        <div className={styles.logo}>
          <h1>BookSpot</h1>
          <p>Your literary companion</p>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <p>© 2026 BookSpot</p>
        </div>
      </aside>
    </>
  );
}
```

### Update `Sidebar.module.css`

Add logo and footer styles:

```css
.hamburger {
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--bn-text);
  background: transparent;
  border: none;
  cursor: pointer;
  margin-bottom: 16px;
}

.hamburger svg {
  width: 24px;
  height: 24px;
}

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

.sidebarFooter {
  padding-top: 24px;
  border-top: 1px solid var(--bn-border);
  margin-top: auto;
}

.sidebarFooter p {
  font-size: 12px;
  color: #666666;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
}
```

## Visual Outcome
- BookSpot logo with tagline at top of sidebar
- Copyright footer at bottom
- Mobile hamburger menu for closing sidebar
