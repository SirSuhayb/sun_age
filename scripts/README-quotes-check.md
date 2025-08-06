# Unescaped Quotes Check

This script helps prevent React's `react/no-unescaped-entities` error by checking for unescaped quotes in JSX/TSX files before committing.

## Quick Usage

```bash
# Check all staged files
npm run check-quotes

# Or run directly
node scripts/check-unescaped-quotes.js
```

## Setting Up Pre-commit Hook (Recommended)

To automatically check for unescaped quotes before every commit:

```bash
# Copy the pre-commit hook to your git hooks directory
cp scripts/pre-commit-hook-example .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit
```

Now, every time you try to commit, it will check for unescaped quotes and prevent the commit if any are found.

## Common Replacements

When the script finds unescaped quotes, use these replacements:

| Character | Replace with | HTML Entity |
|-----------|--------------|-------------|
| ' (apostrophe) | `&apos;` | `&#39;` |
| " (quote) | `&quot;` | `&#34;` |
| ' (left single quote) | `&lsquo;` | `&#8216;` |
| ' (right single quote) | `&rsquo;` | `&#8217;` |
| " (left double quote) | `&ldquo;` | `&#8220;` |
| " (right double quote) | `&rdquo;` | `&#8221;` |

## Examples

❌ **Wrong:**
```jsx
<p>Today's weather is nice</p>
<p>She said "Hello"</p>
```

✅ **Correct:**
```jsx
<p>Today&apos;s weather is nice</p>
<p>She said &ldquo;Hello&rdquo;</p>
```

## Alternative: Using Template Literals

You can also use template literals (backticks) to avoid escaping:

```jsx
<p>{`Today's weather is nice`}</p>
<p>{`She said "Hello"`}</p>
```

## Disabling the Hook Temporarily

If you need to commit without the check:

```bash
git commit --no-verify -m "your message"
```

## Adding to CI/CD

You can also add this check to your CI pipeline:

```yaml
# In your GitHub Actions workflow
- name: Check for unescaped quotes
  run: npm run check-quotes
```