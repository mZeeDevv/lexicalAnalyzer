# 🎯 Demo Focus: Critical Validation Checks

## **For Your Demo - Show These 4 Key Validations:**

---

## ✅ **1. LINE NUMBER TRACKING** 
*Lines 133-140 in lexer.js*

```javascript
let lineNumber = 1;  // Start counting from line 1

// Track line numbers throughout the entire process
if (char === '\n') {
    lineNumber++;    // ← KEY CHECK: Increment on every newline
}

// Even inside strings, we still track line numbers!
if (source[i] === '\n') lineNumber++;  // ← Inside string processing
```

**Demo Point:** "Every token knows exactly which line it came from, even inside multi-line strings!"

---

## ✅ **2. CONTEXT-AWARE COMMENT DETECTION**
*Lines 143-164 in lexer.js*

```javascript
// CRITICAL: Only check for comments when NOT inside strings
if (!inStringLiteral && !inCharLiteral) {
    // ... comment detection logic here
}

// Inside strings, everything is preserved (including //)
while (i < source.length && (source[i] !== '"' || source[i-1] === '\\')) {
    stringToken += source[i];  // ← Preserves // inside strings
}
```

**Demo Point:** "The lexer knows `//` inside a string is NOT a comment!"

---

## ✅ **3. ESCAPE SEQUENCE VALIDATION**
*Line 156 in lexer.js*

```javascript
// The CRITICAL escape check:
while (i < source.length && 
       (source[i] !== '"' || source[i-1] === '\\')) {
    //                    ^^^^^^^^^^^^^^^^^^^^^^
    //                    This prevents \" from ending the string!
```

**Demo Point:** "Escaped quotes `\"` don't accidentally end strings!"

---

## ✅ **4. GREEDY OPERATOR MATCHING**
*Lines 200-210 in lexer.js*

```javascript
// Try multi-character operators FIRST
let operator = char;
if (this.operators.has(char + nextChar)) {
    operator = char + nextChar;  // Take 2-char operator
    i++;                        // Skip next character
} else if (this.operators.has(char + nextChar + source[i + 2])) {
    operator = char + nextChar + source[i + 2];  // Take 3-char operator  
    i += 2;                     // Skip next two characters
}
```

**Demo Point:** "`<<=` is recognized as ONE operator, not three separate ones!"

---

## 🎤 **Perfect Demo Code Example:**

```cpp
#include <iostream>
int main() {
    std::string path = "C:\\folder // NOT a comment";  // Line 3
    int x = 10;     // This IS a comment              // Line 4
    x <<= 2;        // Left shift assignment          // Line 5
    x >= 5;         // Comparison operator            // Line 6
    return 0;
}
```

## 🎯 **What to Point Out:**

### **Line Tracking:**
- `std::string` → Line 3 ✓
- `x` → Line 4 ✓  
- `<<=` → Line 5 ✓
- `>=` → Line 6 ✓

### **Comment Intelligence:**
- `"C:\\folder // NOT a comment"` → String preserved ✓
- `// This IS a comment` → Properly removed ✓

### **Escape Handling:**
- `\\` → Single escaped backslash ✓
- `//` inside string → Preserved as literal text ✓

### **Operator Recognition:**
- `<<=` → Single "Left Shift Assignment" operator ✓
- `>=` → Single "Greater Than or Equal" operator ✓

---

## 🔍 **Demo Script:**

1. **Paste the demo code** into your interface
2. **Click "Analyze Code"** 
3. **Show the Tokens tab** - point out line numbers
4. **Show specific examples:**
   - String with `//` inside → goes to "String Literals" table
   - `<<=` operator → goes to "Operators" table as single token
   - Comment after code → completely removed from tokens
5. **Show Statistics tab** - accurate counts

## 🎯 **Key Message:**
*"This lexer doesn't just split text - it understands C++ context and handles edge cases that would break simpler parsers!"*