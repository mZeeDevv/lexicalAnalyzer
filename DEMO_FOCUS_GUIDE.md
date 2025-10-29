# Demo Focus: Line Break Handling & Key Checks

## 🎯 **Demo Highlights: What to Show**

Focus on these **4 key validation mechanisms** that demonstrate the lexer's intelligence:

---

## 1. 📏 **Line Number Tracking**

### **How Line Numbers Are Maintained:**

```javascript
// In tokenize() function
let lineNumber = 1;  // Start at line 1

for (let i = 0; i < source.length; i++) {
    const char = source[i];
    
    // Track line numbers throughout scanning
    if (char === '\n') {
        lineNumber++;  // Increment on every newline
    }
    
    // Every token gets the current line number
    this.addToken(type, value, lineNumber);
}
```

### **Demo Example:**
```cpp
int x = 10;     // Line 1
// Comment       // Line 2  
int y = 20;     // Line 3
```

**Show Result:**
- `int` → Line 1
- `x` → Line 1  
- `=` → Line 1
- `10` → Line 1
- `int` → Line 3
- `y` → Line 3

---

## 2. 🔍 **Comment vs Code Detection**

### **The Critical Check:**

```javascript
// DON'T process comments inside strings!
if (char === '"' && !inCharLiteral) {
    // STRING PROCESSING - comments inside are preserved
    let stringToken = '"';
    i++;
    while (i < source.length && (source[i] !== '"' || source[i-1] === '\\')) {
        stringToken += source[i];
        if (source[i] === '\n') lineNumber++;  // ← Still track lines in strings!
        i++;
    }
}

// ONLY check for comments if NOT inside string
if (!inStringLiteral && !inCharLiteral) {
    if (char === '/' && nextChar === '/') {
        inSingleLineComment = true;  // ← Start skipping
    }
}
```

### **Demo Example:**
```cpp
std::string path = "C://not_a_comment";  // Line 1
int x = 5; // This IS a comment         // Line 2
```

**Show that:**
- `"C://not_a_comment"` → Recognized as String Literal
- `// This IS a comment` → Properly removed

---

## 3. ⚡ **Multi-Character Operator Recognition**

### **The Lookahead Logic:**

```javascript
// Greedy operator matching
let operator = char;  // Start with single character

// Try 2-character operators first
if (this.operators.has(char + nextChar)) {
    operator = char + nextChar;
    i++;  // Skip next character
}
// Try 3-character operators
else if (i < source.length - 2 && 
         this.operators.has(char + nextChar + source[i + 2])) {
    operator = char + nextChar + source[i + 2];
    i += 2;  // Skip next two characters
}
```

### **Demo Example:**
```cpp
x <<= 5;  // Left shift assignment
y <= 10;  // Less than or equal
z < 3;    // Less than
```

**Show Recognition:**
- `<<=` → Single operator (not `<` + `<` + `=`)
- `<=` → Single operator (not `<` + `=`)
- `<` → Single character operator

---

## 4. 🎭 **String Escape Sequence Handling**

### **The Escape Logic:**

```javascript
// Continue reading string until closing quote
while (i < source.length && 
       (source[i] !== '"' || source[i-1] === '\\')) {  // ← Key check!
    
    stringToken += source[i];
    if (source[i] === '\n') lineNumber++;
    i++;
}
```

### **Demo Example:**
```cpp
char msg[] = "He said \"Hello World!\"";
char path[] = "C:\\Users\\file.txt";
char newline[] = "Line 1\nLine 2";
```

**Show that lexer correctly handles:**
- `\"` → Escaped quote (not end of string)
- `\\` → Escaped backslash  
- `\n` → Escaped newline

---

## 🎯 **Demo Script: Step-by-Step Walkthrough**

### **Sample Code for Demo:**
```cpp
#include <iostream>     // Line 1 - Preprocessor
                        // Line 2 - Empty line
int main() {            // Line 3 - Function declaration
    // Variables         // Line 4 - Comment (will be removed)
    std::string msg = "Path: C:\\folder // Not comment";  // Line 5
    int x = 10;         // Line 6
    x += 5;             // Line 7 - Compound operator
    x <<= 2;            // Line 8 - Bitwise shift assign
    
    if (x >= 50) {      // Line 9 - Comparison
        std::cout << "Result: " << x << std::endl;  // Line 10
    }
    return 0;           // Line 11
}
```

### **Point Out These Checks During Demo:**

#### **1. Line Tracking Accuracy:**
- Show how `std::string` on line 5 is correctly identified
- Point out that `x` appears on lines 6, 7, 8, 9 with correct line numbers

#### **2. Comment Intelligence:**
```cpp
std::string msg = "Path: C:\\folder // Not comment";  // Line 5
```
- **Inside String**: `// Not comment` is preserved in the string
- **Outside String**: `// Line 5` is properly removed

#### **3. Operator Precedence:**
```cpp
x += 5;    // Recognized as single `+=` operator
x <<= 2;   // Recognized as single `<<=` operator  
x >= 50;   // Recognized as single `>=` operator
```

#### **4. String Escape Handling:**
```cpp
"Path: C:\\folder // Not comment"
```
- `\\` → Recognized as escaped backslash (not two separate backslashes)
- `//` → Preserved as literal characters (not comment start)

---

## 🎤 **Demo Talking Points**

### **1. "Smart Line Tracking"**
> "Notice how the lexer maintains accurate line numbers even when processing multi-line strings and skipping comments. This is crucial for error reporting in real compilers."

### **2. "Context-Aware Processing"** 
> "The lexer knows the difference between `//` inside a string versus `//` in code. This context awareness prevents false comment detection."

### **3. "Greedy Operator Matching"**
> "When the lexer sees `<<=`, it doesn't parse it as `<` + `<` + `=`. It uses lookahead to find the longest possible operator match first."

### **4. "Robust String Handling"**
> "Escaped characters like `\"` and `\\` are properly handled so strings can contain quotes and backslashes without breaking the parser."

---

## 🔍 **Key Validation Functions to Highlight**

### **1. Line Number Validation:**
```javascript
// Every token knows its exact source location
this.addToken(type, value, lineNumber);
```

### **2. Context State Checking:**
```javascript
// Multiple state flags prevent conflicts
if (!inStringLiteral && !inCharLiteral) {
    // Only then check for comments
}
```

### **3. Escape Sequence Validation:**
```javascript
// Look at previous character for escape detection
(source[i] !== '"' || source[i-1] === '\\')
```

### **4. Operator Boundary Detection:**
```javascript
// Save accumulated token before processing operators
if (token !== "") {
    this.categorizeToken(token, lineNumber);
    token = "";
}
```

---

## 🎯 **Demo Success Metrics**

**Show that your lexer correctly:**
1. ✅ **Tracks lines** - Every token has correct line number
2. ✅ **Preserves context** - Comments in strings aren't removed  
3. ✅ **Handles escapes** - `\"` doesn't end strings prematurely
4. ✅ **Recognizes patterns** - Multi-character operators work correctly
5. ✅ **Maintains accuracy** - No tokens are lost or misclassified

This focused approach will demonstrate the **intelligence and robustness** of your lexical analyzer! 🚀