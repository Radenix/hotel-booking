# Hotel Booking Planner (Frontend Assessment)

Interactive React + TypeScript application that lets users configure a multi-day trip, choose hotels per destination, enforce board-type meal rules, and see real-time pricing summaries.


- Repo: https://github.com/Radenix/hotel-booking
- Demo: https://hotel-booking-assestment.vercel.app

## Tech Stack

- **React 19** + **TypeScript** + **Vite** - Modern, fast development experience
- **Redux Toolkit** - Centralized state management with simplified Redux patterns
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Redux** - Official React bindings for Redux

## Features

- Step-by-step UX (configuration → daily plan → summary)
- Dynamic table that generates one row per travel day
- Board-type business logic (Full, Half, No board) with disabled or mutually exclusive meals
- Pricing breakdown per day and aggregate total with currency formatting
- Validation hints (e.g., "pick a hotel for each day" chip)
- Mobile-friendly responsive layout with stacked cards/tables
- Loading states with smooth animations
- Smooth transitions and animations throughout the UI

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository** (or extract the project files)

```bash
cd hotel-booking
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Starts the Vite development server with hot module replacement
- `npm run build` - Creates an optimized production build in the `dist/` folder
- `npm run preview` - Previews the production build locally
- `npm run lint` - Runs ESLint to check code quality

### Building for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist/` directory, ready for deployment to any static hosting service.

## Technology Choices and Justifications

### React 19 + TypeScript

**Why:** React provides a component-based architecture that makes the UI modular and maintainable. TypeScript adds type safety, catching errors at compile-time and improving developer experience with better IDE support and autocomplete.

**Benefits:**
- Strong typing prevents runtime errors
- Better refactoring capabilities
- Self-documenting code through types
- React 19 includes performance improvements and new features

### Vite

**Why:** Vite offers lightning-fast development server startup and hot module replacement (HMR), significantly improving developer experience compared to traditional bundlers.

**Benefits:**
- Near-instant server start
- Fast HMR for rapid iteration
- Optimized production builds with Rollup
- Native ES modules support

### Redux Toolkit

**Why:** Redux Toolkit simplifies Redux usage with less boilerplate and better patterns. It's ideal for managing complex application state that needs to be shared across multiple components.

**Benefits:**
- Simplified Redux patterns with `createSlice`
- Built-in Immer for immutable updates
- DevTools integration out of the box
- Better TypeScript support
- Centralized state makes debugging easier
- Predictable state updates

**Justification for this project:** While the original implementation used local state, Redux provides:
- Better scalability if features expand
- Easier state debugging with Redux DevTools
- Clear separation of concerns
- Foundation for future features like persistence, undo/redo, or time-travel debugging

### Tailwind CSS

**Why:** Tailwind CSS provides utility-first styling that enables rapid UI development without writing custom CSS. It's highly customizable and produces small production bundles through purging unused styles.

**Benefits:**
- Rapid UI development with utility classes
- Consistent design system
- Responsive design utilities built-in
- Small production bundle size (unused styles are purged)
- Easy to customize via `tailwind.config.js`
- No CSS naming conflicts

**Justification:** Replaces custom CSS with a maintainable, scalable styling approach that's easier to work with and provides better consistency.

### React Redux

**Why:** Official React bindings for Redux, providing optimized hooks (`useSelector`, `useDispatch`) that work seamlessly with React's rendering cycle.

**Benefits:**
- Optimized re-renders (only components using changed state re-render)
- TypeScript support with proper typing
- Well-maintained and widely adopted

## Architecture Decisions

### State Management Architecture

The application uses **Redux Toolkit** with a slice-based architecture:

```
store/
  ├── index.ts              # Store configuration and root reducer
  ├── hooks.ts              # Typed Redux hooks for TypeScript
  └── slices/
      ├── tripConfigSlice.ts        # Trip configuration state
      ├── dailySelectionsSlice.ts   # Daily hotel/meal selections
      └── loadingSlice.ts           # Loading state management
```

**Decision Rationale:**
- **Separation of Concerns:** Each slice manages a specific domain of state
- **Scalability:** Easy to add new slices as features grow
- **Maintainability:** Clear boundaries between different state domains
- **Type Safety:** Full TypeScript support with typed actions and state

### Slice Organization

1. **tripConfigSlice** - Manages trip-level configuration:
   - Citizenship, start date, duration, destination, board type
   - Centralized configuration that affects the entire trip

2. **dailySelectionsSlice** - Manages per-day selections:
   - Hotel selections per date
   - Meal selections (lunch/dinner) per date
   - Handles synchronization when trip dates change

3. **loadingSlice** - Manages loading states:
   - Global loading indicator
   - Loading messages for better UX

### Component Architecture

- **App.tsx** - Main application component containing all UI logic
- **Data layer** (`data.ts`) - Static data models separated from UI logic
- **Store layer** - Redux slices for state management
- **Presentation layer** - React components with Tailwind styling

### Derived Data Strategy

- **Memoization:** Trip dates, daily breakdown, and totals are computed using `useMemo` to prevent unnecessary recalculations
- **Selectors:** Redux selectors could be added for complex derived state if needed
- **Computed in Components:** Simple calculations remain in components for clarity

### Business Logic Implementation

- **Board Type Rules:** Enforced in Redux actions and reducers
  - Full Board (FB): Allows both lunch and dinner
  - Half Board (HB): Mutually exclusive - only one meal allowed
  - No Board (NB): Disables all meal selections
- **Date Synchronization:** Automatically syncs daily selections when trip dates change
- **Validation:** UI hints and disabled states guide users to valid configurations

### Styling Architecture

- **Tailwind Utility Classes:** All styling done through Tailwind classes
- **Custom Animations:** Defined in `tailwind.config.js` for reusable animations
- **Responsive Design:** Mobile-first approach with Tailwind breakpoints
- **Component-Level Styling:** Styles co-located with components for better maintainability

### Loading States and Animations

- **Loading Overlay:** Full-screen overlay with spinner during data operations
- **Smooth Animations:** Custom animations for:
  - Fade in effects
  - Slide down/up transitions
  - Scale animations
  - Staggered list animations
- **User Feedback:** Visual feedback for all interactions

## Project Structure

```
src/
  ├── App.tsx                    # Main application component
  ├── index.css                  # Global styles and Tailwind imports
  ├── main.tsx                   # React bootstrap with Redux Provider
  ├── data.ts                    # Static data models (countries, hotels, meals)
  └── store/
      ├── index.ts               # Redux store configuration
      ├── hooks.ts               # Typed Redux hooks
      └── slices/
          ├── tripConfigSlice.ts        # Trip configuration state
          ├── dailySelectionsSlice.ts   # Daily selections state
          └── loadingSlice.ts           # Loading state
```

## Known Limitations

### Current Limitations

1. **Static Data:** All data (countries, hotels, meals) is hardcoded in `data.ts`. No backend integration or API calls.

2. **No Persistence:** User selections are not saved. Refreshing the page resets all data.

3. **No Validation:** Basic validation exists (e.g., "pick a hotel for each day" hint), but no comprehensive form validation library.

4. **Silent State Changes:** When switching to "No Board", meal selections are cleared without user confirmation or undo capability.

5. **No Error Handling:** No error boundaries or error states for edge cases.

6. **Limited Accessibility:** Basic accessibility features, but could benefit from ARIA labels, keyboard navigation improvements, and screen reader optimizations.

7. **No Testing:** No unit tests or integration tests included in the current implementation.

8. **Single Currency:** Only USD currency formatting is supported.

9. **No Date Validation:** Limited validation on date inputs (e.g., no check for past dates beyond the `min` attribute).

10. **No Loading States for Async Operations:** While loading states exist, they're simulated. Real API calls would need proper async handling.

## Future Improvements

### Short-term Enhancements

1. **Data Persistence**
   - Implement `localStorage` to save user selections
   - Add session persistence across page refreshes
   - Export/import booking configurations

2. **Enhanced Validation**
   - Add comprehensive form validation (e.g., React Hook Form)
   - Real-time validation feedback
   - Prevent invalid submissions

3. **Better UX for State Changes**
   - Confirmation modal when switching board types
   - Undo/redo functionality for selections
   - Toast notifications for important actions

4. **Accessibility Improvements**
   - Full ARIA label coverage
   - Keyboard navigation enhancements
   - Screen reader optimizations
   - Focus management improvements

### Medium-term Features

5. **Backend Integration**
   - API integration for dynamic data
   - Real-time pricing updates
   - Availability checking
   - Booking submission

6. **Advanced Features**
   - Multiple travelers support
   - Tax calculations
   - Multi-currency support
   - Promotional codes and discounts
   - Saved itineraries

7. **Testing Infrastructure**
   - Unit tests for Redux slices
   - Component tests with React Testing Library
   - Integration tests for user flows
   - E2E tests with Playwright or Cypress

8. **Performance Optimizations**
   - Code splitting for route-based chunks
   - Lazy loading of components
   - Virtual scrolling for large date ranges
   - Memoization of expensive calculations

### Long-term Vision

9. **Advanced Booking Features**
   - Multi-room bookings
   - Guest preferences
   - Special requests
   - Payment integration

10. **Analytics and Monitoring**
    - User behavior tracking
    - Performance monitoring
    - Error tracking (e.g., Sentry)

11. **Internationalization**
    - Multi-language support (i18n)
    - Locale-specific formatting
    - RTL language support

12. **Export and Sharing**
    - PDF export of booking summary
    - Print-optimized views
    - Shareable booking links
    - Email confirmations

## Testing

While Jest + React Testing Library are not included to keep the submission lightweight, obvious test candidates include:

### Unit Tests
- Redux slice reducers and actions
- Utility functions (date formatting, currency formatting)
- Business logic (board type rules, meal exclusivity)

### Integration Tests
- Enforcing HB mutual exclusivity
- Preventing meal selection when NB is active
- Verifying daily/grand totals with mocked data
- Date synchronization when trip configuration changes

### Component Tests
- Form inputs and validation
- Loading states display
- Responsive layout behavior
- Animation triggers

## Development Notes

### Redux DevTools

The Redux store is configured with DevTools support. Install the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools-extension) in your browser to:
- Inspect state changes
- Time-travel debugging
- Action replay
- State export/import

### Code Style

- ESLint is configured for code quality
- TypeScript strict mode enabled
- Consistent formatting with Prettier (if configured)

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features required
- CSS Grid and Flexbox support needed

## License

This project is part of a technical assessment and is not intended for production use without proper licensing and security review.
