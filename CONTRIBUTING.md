# Contributing to Session Booking Platform

First off, thank you for considering contributing to the Session Booking Platform! It's people like you that make this project better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other applications if applicable**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

1. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/booking.git
cd booking
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Avoid `any` types when possible
- Use proper type definitions

### React/Next.js
- Use functional components with hooks
- Follow React best practices
- Use the App Router (not Pages Router)

### Styling
- Use Tailwind CSS utility classes
- Follow the existing design system
- Ensure responsive design

### Code Style
- Use ESLint and Prettier
- Run `npm run lint` before committing
- Keep functions small and focused
- Write meaningful variable and function names

### Commits
- Use clear, descriptive commit messages
- Follow conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for formatting
  - `refactor:` for code refactoring
  - `test:` for tests
  - `chore:` for maintenance

Example:
```
feat: add email notification for booking confirmations
fix: resolve date formatting issue in payment page
docs: update README with deployment instructions
```

## Testing

- Test your changes in multiple browsers
- Test responsive design on different screen sizes
- Test with different languages (EN, PT, FR, DE)
- Verify database migrations work correctly

## Database Changes

If you modify the Prisma schema:

1. Create a migration:
```bash
npx prisma migrate dev --name descriptive_name
```

2. Update the seed file if needed
3. Test the migration on a fresh database
4. Document any breaking changes

## Translation

When adding new features that require text:

1. Add translation keys to all language files:
   - `public/locales/en/*.json`
   - `public/locales/pt/*.json`
   - `public/locales/fr/*.json`
   - `public/locales/de/*.json`

2. Use the `useTranslation` hook:
```tsx
const { t } = useTranslation();
<p>{t('namespace:key')}</p>
```

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments for complex functions
- Update API documentation for new endpoints
- Include examples in your documentation

## Questions?

Feel free to open an issue with the `question` label if you need help or clarification.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
