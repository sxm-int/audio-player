# Testing Guide

This project uses [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/react) for unit testing.

## Running Tests

```bash
# Run tests in watch mode (default)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests for a specific file
npm test -- path/to/file.test.tsx
```

## Project Structure

```
src/
├── components/
│   ├── Controls.tsx
│   └── Controls.test.tsx       # Component tests
├── lib/
│   ├── format.ts
│   └── format.test.ts          # Unit tests
└── test/
    ├── setup.ts                # Test setup and configuration
    ├── test-utils.tsx          # Custom render functions
    └── vitest.d.ts             # TypeScript type definitions
```

## Writing Tests

### Basic Unit Test

For pure functions, write straightforward unit tests:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction(input)).toBe(expectedOutput);
  });
});
```

### Testing React Components

For components that don't use Redux:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Testing Redux-Connected Components

For components that use Redux hooks:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders as render } from '../test/test-utils';
import MyComponent from './MyComponent';

// Mock the hooks with specific state
vi.mock('../hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({
    player: {
      isPlaying: false,
      // ... other state
    },
  }),
}));

describe('MyComponent', () => {
  it('renders with Redux state', () => {
    render(<MyComponent />);
    expect(screen.getByText('Not Playing')).toBeInTheDocument();
  });
});
```

## Available Testing Utilities

### jest-dom Matchers

The following custom matchers are available (via `@testing-library/jest-dom`):

- `toBeInTheDocument()`
- `toHaveClass(className)`
- `toHaveAttribute(attr, value)`
- `toHaveTextContent(text)`
- `toBeDisabled()`
- `toBeVisible()`
- And many more...

See [jest-dom documentation](https://github.com/testing-library/jest-dom) for full list.

### Query Methods

Use these to find elements in your tests:

- `getByRole()` - Preferred for accessibility
- `getByLabelText()` - For form inputs
- `getByText()` - For text content
- `getByTestId()` - As a last resort
- `queryBy*()` - Returns null if not found (for asserting absence)
- `findBy*()` - Async queries that wait for element

## Best Practices

1. **Use accessible queries**: Prefer `getByRole` and `getByLabelText` over `getByTestId`
2. **Test user behavior**: Test what users see and do, not implementation details
3. **Avoid testing implementation details**: Don't test internal state or methods
4. **Use user-event**: Prefer `userEvent` over `fireEvent` for more realistic interactions
5. **Keep tests simple**: One assertion per test when possible
6. **Use descriptive test names**: Tests should read like documentation

## Configuration

### vitest.config.ts

The Vitest configuration includes:
- **globals: true** - Use global test functions without importing
- **environment: 'jsdom'** - Simulates browser environment
- **setupFiles** - Runs setup before each test file
- **coverage** - Configuration for code coverage reports

### Test Setup (src/test/setup.ts)

- Extends Vitest with jest-dom matchers
- Automatically cleans up after each test

## Troubleshooting

### Tests fail with "not a function" errors

Make sure you're importing from the correct location and that mocks are set up properly.

### Type errors in tests

Ensure `src/test/vitest.d.ts` is included in your TypeScript configuration.

### Redux-related errors

Use `renderWithProviders` from `src/test/test-utils.tsx` instead of the default `render` function.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
