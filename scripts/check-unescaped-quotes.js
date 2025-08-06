#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Get list of staged files
let stagedFiles;
try {
  stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM')
    .toString()
    .split('\n')
    .filter(file => file && (file.endsWith('.tsx') || file.endsWith('.jsx')));
} catch (error) {
  console.log(`${YELLOW}No staged files found or git not available${RESET}`);
  process.exit(0);
}

if (stagedFiles.length === 0) {
  console.log(`${GREEN}No JSX/TSX files to check${RESET}`);
  process.exit(0);
}

console.log(`Checking ${stagedFiles.length} file(s) for unescaped quotes...`);

let errorsFound = false;
const errors = [];

// Pattern to match unescaped quotes in JSX text content
// This is a simplified check - not perfect but catches common cases
const unescapedQuotePatterns = [
  />[^<]*[^\\]'[^<]*</g,  // Unescaped apostrophe
  />[^<]*[^\\]"[^<]*</g,  // Unescaped double quote
];

stagedFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Skip comments and non-JSX lines
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return;
    }
    
    // Check for unescaped quotes in JSX text content
    unescapedQuotePatterns.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Filter out false positives (attributes, etc.)
          if (!match.includes('=') && !match.includes('className')) {
            errors.push({
              file,
              line: index + 1,
              content: line.trim(),
              match
            });
            errorsFound = true;
          }
        });
      }
    });
    
    // Additional check for common patterns
    if (line.includes("'s ") || line.includes("'t ") || line.includes("'re ") || line.includes("'ve ") || line.includes("'ll ") || line.includes("'d ")) {
      // Check if it's inside JSX text (not in attributes or JS code)
      const beforeQuote = line.substring(0, line.indexOf("'"));
      const afterQuote = line.substring(line.indexOf("'") + 1);
      
      if (beforeQuote.lastIndexOf('>') > beforeQuote.lastIndexOf('<') && 
          afterQuote.indexOf('<') !== -1 && 
          !beforeQuote.endsWith('=')) {
        errors.push({
          file,
          line: index + 1,
          content: line.trim(),
          suggestion: line.replace(/'/g, '&apos;')
        });
        errorsFound = true;
      }
    }
  });
});

if (errorsFound) {
  console.log(`\n${RED}❌ Found unescaped quotes in the following locations:${RESET}\n`);
  
  errors.forEach(error => {
    console.log(`${YELLOW}${error.file}:${error.line}${RESET}`);
    console.log(`  ${error.content}`);
    if (error.suggestion) {
      console.log(`  ${GREEN}Suggestion: Use &apos; instead of '${RESET}`);
    }
    console.log('');
  });
  
  console.log(`${RED}Please escape these quotes before committing:${RESET}`);
  console.log(`  - Use ${GREEN}&apos;${RESET} or ${GREEN}&lsquo;${RESET} for apostrophes`);
  console.log(`  - Use ${GREEN}&quot;${RESET} or ${GREEN}&ldquo;${RESET} for double quotes`);
  console.log(`  - Or use template literals with backticks\n`);
  
  process.exit(1);
} else {
  console.log(`${GREEN}✓ No unescaped quotes found!${RESET}`);
  process.exit(0);
}