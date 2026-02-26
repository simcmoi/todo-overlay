# Contributing to BlinkDo

First off, thank you for considering contributing to BlinkDo! 🎉

It's people like you that make BlinkDo such a great tool. We welcome contributions from everyone, whether you're fixing a typo, adding a feature, or improving documentation.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and respectful environment. Please:

- ✅ Be respectful and inclusive
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others

## 🚀 Getting Started

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/blinkdo.git
   cd blinkdo
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start development server**:
   ```bash
   npm run tauri dev
   ```

### Prerequisites

- Node.js 20+
- Rust 1.70+
- Platform-specific dependencies (see [README.md](README.md#prerequisites--prérequis))

## 🤝 How to Contribute

### Reporting Bugs

Found a bug? Please [open an issue](https://github.com/simcmoi/blinkdo/issues/new) with:

- **Clear title** - Brief description of the issue
- **Description** - Detailed explanation of the problem
- **Steps to reproduce** - How to trigger the bug
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Screenshots** - If applicable
- **Environment** - OS, version, etc.

**Example:**
```
Title: App crashes when creating subtask with long title

Description: The app crashes when I try to create a subtask with more than 500 characters.

Steps to reproduce:
1. Open the app
2. Create a new task
3. Add a subtask
4. Type more than 500 characters
5. Press Enter

Expected: Subtask should be created
Actual: App crashes with error message

Environment: macOS 14.2, App version 0.2.1
```

### Suggesting Features

Have an idea? Please [open a feature request](https://github.com/simcmoi/blinkdo/issues/new) with:

- **Clear title** - Brief description of the feature
- **Problem statement** - What problem does this solve?
- **Proposed solution** - How would it work?
- **Alternatives** - Other approaches considered
- **Use case** - Real-world scenarios

### Contributing Code

1. **Check existing issues** - Make sure your contribution is needed
2. **Create an issue first** - For major changes, discuss before coding
3. **Fork and branch** - Create a feature branch from `main`
4. **Code your changes** - Follow our coding standards
5. **Test thoroughly** - Add tests for new features
6. **Submit a PR** - Reference the issue number

## 🔄 Pull Request Process

### Before Submitting

- ✅ Run tests: `npm test`
- ✅ Run linter: `npm run lint`
- ✅ Build successfully: `npm run tauri build`
- ✅ Update documentation if needed
- ✅ Add yourself to contributors (if first PR)

### PR Template

When opening a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. Maintainers will review your PR within 1-3 days
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your changes will be included in the next release

## 💻 Coding Standards

### TypeScript/React

```typescript
// ✅ Good: Functional components with TypeScript
interface TaskProps {
  task: Task;
  onUpdate: (task: Task) => void;
}

export function TaskItem({ task, onUpdate }: TaskProps) {
  const handleCheck = () => {
    onUpdate({ ...task, completed: !task.completed });
  };

  return (
    <div className="task-item">
      <Checkbox checked={task.completed} onCheckedChange={handleCheck} />
      <span>{task.title}</span>
    </div>
  );
}

// ❌ Bad: Class components, no types
export class TaskItem extends React.Component {
  render() {
    return <div>...</div>;
  }
}
```

### Rust

```rust
// ✅ Good: Clear documentation, error handling
/// Saves todo data to the local storage file
/// 
/// # Arguments
/// * `app_handle` - The Tauri app handle for accessing app directories
/// * `data` - The todo data to save
/// 
/// # Returns
/// Result<(), String> - Ok if successful, Err with message if failed
#[tauri::command]
pub async fn save_todos(
    app_handle: AppHandle,
    data: TodoData,
) -> Result<(), String> {
    let path = get_storage_path(&app_handle)?;
    write_json(&path, &data)
        .map_err(|e| format!("Failed to save: {}", e))
}

// ❌ Bad: No docs, poor error handling
pub async fn save_todos(app_handle: AppHandle, data: TodoData) {
    let path = get_storage_path(&app_handle).unwrap();
    write_json(&path, &data).unwrap();
}
```

### General Guidelines

- **Naming**: Use descriptive names (`getUserTodos` not `getData`)
- **Comments**: Explain "why", not "what"
- **Formatting**: Prettier for TS/React, rustfmt for Rust
- **Imports**: Group and sort logically
- **DRY**: Don't Repeat Yourself - extract reusable code

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, missing semi colons, etc)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

### Examples

```bash
# ✅ Good
feat(tasks): add drag and drop reordering
fix(storage): handle JSON parse errors gracefully
docs(readme): update installation instructions
refactor(ui): simplify TaskList component logic

# ❌ Bad
update stuff
fixed bug
changes
```

### Detailed Example

```
feat(notifications): add customizable reminder sounds

Users can now choose from multiple notification sounds or upload their own.
This improves accessibility for users with hearing preferences.

Closes #123
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/store/todos.test.ts
```

### Writing Tests

```typescript
// src/utils/date.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, isOverdue } from './date';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('');
  });
});

describe('isOverdue', () => {
  it('returns true for past dates', () => {
    const pastDate = new Date('2020-01-01');
    expect(isOverdue(pastDate)).toBe(true);
  });

  it('returns false for future dates', () => {
    const futureDate = new Date('2030-01-01');
    expect(isOverdue(futureDate)).toBe(false);
  });
});
```

### Test Coverage

- Aim for **80%+ coverage** on new code
- Test edge cases and error conditions
- Mock external dependencies (file system, network, etc.)

## 📚 Documentation

### When to Update Docs

- ✅ Adding new features
- ✅ Changing public APIs
- ✅ Fixing bugs that affect usage
- ✅ Adding/changing configuration

### Documentation Files

- `README.md` - Overview, features, quick start
- `DOCUMENTATION.md` - Complete documentation hub
- `docs/` - Detailed guides and tutorials
- Inline code comments - For complex logic

### Documentation Style

```markdown
## Feature Name

Brief description of the feature and its purpose.

### Usage

```typescript
// Example code showing how to use the feature
const result = doSomething({ option: true });
```

### Parameters

- `option` (boolean) - Description of what this does

### Returns

Description of return value.

### Example

Real-world example showing practical usage.
```

## 🎯 What to Contribute?

Not sure where to start? Look for issues labeled:

- `good first issue` - Perfect for newcomers
- `help wanted` - We need your expertise
- `bug` - Something isn't working
- `enhancement` - New feature requests
- `documentation` - Docs improvements

### Priority Areas

We especially welcome contributions in:

- 🐛 Bug fixes (especially cross-platform issues)
- 📖 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌍 Internationalization (i18n)

## 🔧 Development Tips

### Hot Reload

Changes to React components reload automatically. For Rust changes, the app will restart.

### Debugging

**Frontend (React):**
- Use React DevTools extension
- Check browser console (open DevTools with `Cmd+Shift+I` on macOS)

**Backend (Rust):**
- Use `println!()` or `dbg!()` for quick debugging
- Check app logs in Settings > Debug Logs

### Common Issues

**Build fails:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run tauri build
```

**Rust compilation errors:**
```bash
# Update Rust
rustup update
```

## 📞 Getting Help

- 💬 **GitHub Discussions** - Ask questions, share ideas
- 🐛 **GitHub Issues** - Report bugs, request features
- 📖 **Documentation** - Check [DOCUMENTATION.md](DOCUMENTATION.md)

## 🏆 Recognition

All contributors will be:
- Listed in [CHANGELOG.md](CHANGELOG.md) for their contributions
- Mentioned in release notes
- Added to GitHub's contributors graph

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions make BlinkDo better for everyone. Every bug report, feature request, and pull request is appreciated! 

**Happy coding!** 🚀

