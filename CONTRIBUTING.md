# Contributing to Message Wall

We love your input! We want to make contributing to Message Wall as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](../../issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](../../issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

1. Clone your fork of the repository
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env`
4. Set up the database: `npx prisma migrate dev`
5. Start development server: `npm run dev`

## Code Style

- We use ESLint and Prettier for code formatting
- Run `npm run lint` to check for issues
- Run `npm run format` to auto-fix formatting issues
- Follow TypeScript best practices
- Use functional components with hooks
- Follow the existing code patterns

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
