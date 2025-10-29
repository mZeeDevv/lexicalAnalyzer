# Character-by-Character Reading Process in the Lexical Analyzer

## 🔍 **Overview: How We Read Each Character**

The lexer uses a **character-by-character scanning approach** with **lookahead** to detect patterns like comments, operators, and strings. Here's exactly how it works:

---

## 🔄 **Main Character Reading Loop**

```javascript
for (let i = 0; i < source.length; i++) {
    const char = source[i];                    // Current character
    const nextChar = i < source.length - 1 ? source[i + 1] : '';  // Lookahead
    
    // Process character based on context and type...
}
```

### **Key Concepts:**
- **Current Character (`char`)**: The character we're examining right now
- **Lookahead (`nextChar`)**: The next character (for multi-character patterns)
- **State Variables**: Track what context we're in (comment, string, etc.)

---

## 💬 **Comment Detection: Step-by-Step**

### **1. Single-Line Comments (`//`)**

```javascript
// Step 1: Check if current char is '/' and next char is '/'
if (char === '/' && nextChar === '/') {
    inSingleLineComment = true;  // Set state flag
    i++;                        // Skip the second '/' 
    continue;                   // Move to next iteration
}

// Step 2: While in single-line comment state
if (inSingleLineComment) {
    if (char === '\n') {        // End comment at newline
        inSingleLineComment = false;
        result += '\n';         // Keep the newline for structure
    }
    continue;                   // Skip all other characters in comment
}
```

**Visual Example:**
```cpp
int x = 10; // This is a comment\n
int y = 20;
```

| Position | Character | Action | State |
|----------|-----------|--------|--------|
| 10 | `/` | Check next char | Normal |
| 11 | `/` | Start comment state, skip both | `inSingleLineComment = true` |
| 12-29 | `T`, `h`, `i`, `s`... | Skip all | `inSingleLineComment = true` |
| 30 | `\n` | End comment, keep newline | `inSingleLineComment = false` |
| 31 | `i` | Resume normal parsing | Normal |

### **2. Multi-Line Comments (`/* */`)**

```javascript
// Step 1: Detect start of multi-line comment
if (char === '/' && nextChar === '*') {
    inMultiLineComment = true;  // Set state flag
    i++;                       // Skip the '*'
    continue;
}

// Step 2: While in multi-line comment, look for end pattern
if (inMultiLineComment) {
    if (char === '*' && nextChar === '/') {  // Found end pattern
        inMultiLineComment = false;
        i++;                    // Skip the '/'
    }
    continue;                  // Skip all characters until end found
}
```

**Visual Example:**
```cpp
int x = 10; /* This is a 
multi-line comment */ int y = 20;
```

| Position | Character | Action | State |
|----------|-----------|--------|--------|
| 10 | `/` | Check next char | Normal |
| 11 | `*` | Start multi-line comment | `inMultiLineComment = true` |
| 12-40 | Various chars | Skip all | `inMultiLineComment = true` |
| 41 | `*` | Check if next is `/` | `inMultiLineComment = true` |
| 42 | `/` | End comment state | `inMultiLineComment = false` |
| 43 | ` ` | Resume normal parsing | Normal |

---

## 🧵 **String Literal Detection**

### **How We Handle Strings with Escaped Characters:**

```javascript
if (char === '"' && !inCharLiteral) {
    // Start building string token
    let stringToken = '"';
    i++;  // Move past opening quote
    
    // Continue until closing quote (but handle escapes)
    while (i < source.length && (source[i] !== '"' || source[i-1] === '\\')) {
        stringToken += source[i];
        if (source[i] === '\n') lineNumber++;  // Track line numbers in strings
        i++;
    }
    
    if (i < source.length) stringToken += '"';  // Add closing quote
    
    this.addToken('String Literal', stringToken, lineNumber);
}
```

**Escape Sequence Handling:**
- `source[i] !== '"'`: Not a quote, keep going
- `source[i-1] === '\\'`: Previous char is backslash, so this quote is escaped

**Visual Example:**
```cpp
"Hello \"World\" with \\n newline"
```

| Position | Character | Action | Explanation |
|----------|-----------|--------|-------------|
| 0 | `"` | Start string | Opening quote |
| 1-5 | `H`, `e`, `l`, `l`, `o` | Add to string | Normal characters |
| 6 | ` ` | Add to string | Space character |
| 7 | `\` | Add to string | Escape character |
| 8 | `"` | Add to string | Escaped quote (not end) |
| 9-13 | `W`, `o`, `r`, `l`, `d` | Add to string | Normal characters |
| 14 | `\` | Add to string | Escape character |
| 15 | `"` | Add to string | Escaped quote (not end) |
| ... | ... | ... | Continue until real end quote |

---

## ⚡ **Operator Detection**

### **Multi-Character Operator Recognition:**

```javascript
// Handle punctuation and operators
if (this.isPunctuation(char) || this.couldBeOperator(char)) {
    // Save any accumulated token first
    if (token !== "") {
        this.categorizeToken(token, lineNumber);
        token = "";
    }

    // Try to build multi-character operator
    let operator = char;
    if (this.operators.has(char + nextChar)) {           // 2-char operator
        operator = char + nextChar;
        i++;
    } else if (i < source.length - 2 && 
               this.operators.has(char + nextChar + source[i + 2])) {  // 3-char operator
        operator = char + nextChar + source[i + 2];
        i += 2;
    }
    
    // Classify the operator
    if (this.operators.has(operator)) {
        this.addToken('Operator', operator, lineNumber);
    }
}
```

**Greedy Matching Examples:**

| Input | Step 1 | Step 2 | Step 3 | Result |
|-------|--------|--------|--------|---------|
| `<<=` | Try `<` | Try `<<` | Try `<<=` | `<<=` (left shift assign) |
| `<<` | Try `<` | Try `<<` | Not 3-char | `<<` (left shift) |
| `<` | Try `<` | Not 2-char | Not 3-char | `<` (less than) |

---

## 🔤 **Identifier and Keyword Building**

### **Character Accumulation Process:**

```javascript
// For regular characters (letters, digits, underscores)
if (/[a-zA-Z0-9_]/.test(char)) {
    token += char;  // Accumulate character
    continue;
}

// When we hit a delimiter (space, operator, etc.)
if (token !== "") {
    this.categorizeToken(token, lineNumber);  // Process accumulated token
    token = "";  // Reset for next token
}
```

**Token Building Example:**
```cpp
int myVariable = 42;
```

| Position | Character | Token Building | Action |
|----------|-----------|----------------|--------|
| 0-2 | `i`, `n`, `t` | `"int"` | Accumulate |
| 3 | ` ` | - | Categorize `"int"` as Keyword, reset |
| 4-13 | `m`, `y`, `V`... | `"myVariable"` | Accumulate |
| 14 | ` ` | - | Categorize `"myVariable"` as Identifier |
| 15 | `=` | - | Categorize `"="` as Operator |
| 16 | ` ` | - | Skip whitespace |
| 17-18 | `4`, `2` | `"42"` | Accumulate |
| 19 | `;` | - | Categorize `"42"` as Constant |

---

## 🎯 **Special Context Handling**

### **1. Comments Inside Strings (DON'T Remove)**

```javascript
// Handle string literals first, before comment detection
if (char === '"' && !inCharLiteral) {
    // ... string processing (comments inside are preserved)
}

// Only check for comments if NOT inside string
if (!inStringLiteral && !inCharLiteral) {
    // ... comment detection logic
}
```

**Example:**
```cpp
std::string code = "This // is not a comment";  // This IS a comment
```

### **2. Preprocessor Directives**

```javascript
// Detect # at start of line or after newline
if (char === '#' && (i === 0 || source[i-1] === '\n')) {
    let preprocessor = "#";
    i++;
    // Read until end of line
    while (i < source.length && source[i] !== '\n') {
        preprocessor += source[i];
        i++;
    }
    this.addToken('Preprocessor', preprocessor.trim(), lineNumber);
}
```

---

## 🔍 **State Machine Summary**

The lexer maintains several state flags:

| State Variable | Purpose | When True |
|----------------|---------|-----------|
| `inSingleLineComment` | Skip chars until newline | Inside `// comment` |
| `inMultiLineComment` | Skip chars until `*/` | Inside `/* comment */` |
| `inStringLiteral` | Preserve all chars | Inside `"string"` |
| `inCharLiteral` | Preserve all chars | Inside `'char'` |

### **State Transitions:**

```
Normal ──┐
│        │ '/'+'/' ──→ SingleLineComment ──┐ '\n' ──→ Normal
│        │ '/'+'*' ──→ MultiLineComment ───┘ '*'+'/' ─→ Normal
│        │ '"' ─────→ StringLiteral ──────┐ '"' ──→ Normal
│        │ ''' ─────→ CharLiteral ───────┘ ''' ──→ Normal
│        │
└────────┘ (other chars processed normally)
```

---

## 🎯 **Why This Approach Works**

1. **Sequential Processing**: Reads left-to-right like a human
2. **Context Awareness**: Different rules apply in different contexts
3. **Lookahead**: Can detect multi-character patterns
4. **State Memory**: Remembers what mode we're in
5. **Greedy Matching**: Takes longest possible match first

This character-by-character approach with state tracking allows the lexer to correctly handle all the complex cases in C++ source code!