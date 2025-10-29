class Lexer {
    constructor() {
        this.keywords = new Set([
            "auto", "break", "case", "char", "const", "continue", "default", "do",
            "double", "else", "enum", "extern", "float", "for", "goto", "if",
            "int", "long", "register", "return", "short", "signed", "sizeof", "static",
            "struct", "switch", "typedef", "union", "unsigned", "void", "volatile", "while"
        ]);

        this.operators = new Set([
            "+", "-", "*", "/", "%", "=", "==", "!=", "<", ">", "<=", ">=",
            "&&", "||", "!", "&", "|", "^", "~", "<<", ">>", "+=", "-=", "*=",
            "/=", "%=", "&=", "|=", "^=", "<<=", ">>=", "++", "--", "->", "."
        ]);

        this.punctuation = new Set([
            ";", ",", "(", ")", "{", "}", "[", "]", "#", ":"
        ]);

        this.tokens = [];
        this.statistics = {
            keywords: 0,
            identifiers: 0,
            operators: 0,
            constants: 0,
            punctuation: 0,
            strings: 0,
            preprocessor: 0
        };
    }

    // Remove comments (both single-line and multi-line)
    removeComments(source) {
        let result = "";
        let inSingleLineComment = false;
        let inMultiLineComment = false;
        let inStringLiteral = false;
        let inCharLiteral = false;

        for (let i = 0; i < source.length; i++) {
            const char = source[i];
            const nextChar = i < source.length - 1 ? source[i + 1] : '';

            // Handle string literals (don't remove comments inside strings)
            if (char === '"' && !inCharLiteral && !inSingleLineComment && !inMultiLineComment) {
                if (i === 0 || source[i - 1] !== '\\') {
                    inStringLiteral = !inStringLiteral;
                }
                result += char;
                continue;
            }

            // Handle character literals
            if (char === "'" && !inStringLiteral && !inSingleLineComment && !inMultiLineComment) {
                if (i === 0 || source[i - 1] !== '\\') {
                    inCharLiteral = !inCharLiteral;
                }
                result += char;
                continue;
            }

            // Skip comment processing if inside string or char literal
            if (inStringLiteral || inCharLiteral) {
                result += char;
                continue;
            }

            if (inSingleLineComment) {
                if (char === '\n') {
                    inSingleLineComment = false;
                    result += '\n';
                }
                continue;
            }

            if (inMultiLineComment) {
                if (char === '*' && nextChar === '/') {
                    inMultiLineComment = false;
                    i++; // Skip the '/'
                }
                continue;
            }

            if (char === '/' && nextChar === '/') {
                inSingleLineComment = true;
                i++; // Skip the second '/'
                continue;
            }

            if (char === '/' && nextChar === '*') {
                inMultiLineComment = true;
                i++; // Skip the '*'
                continue;
            }

            result += char;
        }

        return result;
    }

    // Remove extra whitespace while preserving structure
    removeWhitespace(source) {
        let result = "";
        let lastWasSpace = true;

        for (const char of source) {
            if (/\s/.test(char)) {
                if (char === '\n') {
                    result += '\n';
                    lastWasSpace = true;
                } else if (!lastWasSpace) {
                    result += ' ';
                    lastWasSpace = true;
                }
            } else {
                result += char;
                lastWasSpace = false;
            }
        }

        return result;
    }

    // Tokenize the source code
    tokenize(source) {
        this.tokens = [];
        this.resetStatistics();
        
        let token = "";
        let lineNumber = 1;
        let inStringLiteral = false;
        let inCharLiteral = false;

        for (let i = 0; i < source.length; i++) {
            const char = source[i];
            const nextChar = i < source.length - 1 ? source[i + 1] : '';

            // Track line numbers
            if (char === '\n') {
                lineNumber++;
            }

            // Handle string literals
            if (char === '"' && !inCharLiteral) {
                if (token !== "" && !inStringLiteral) {
                    this.categorizeToken(token, lineNumber);
                    token = "";
                }
                
                if (!inStringLiteral) {
                    // Start of string
                    let stringToken = '"';
                    i++;
                    while (i < source.length && (source[i] !== '"' || source[i-1] === '\\')) {
                        stringToken += source[i];
                        if (source[i] === '\n') lineNumber++;
                        i++;
                    }
                    if (i < source.length) stringToken += '"';
                    
                    this.addToken('String Literal', stringToken, lineNumber);
                    this.statistics.strings++;
                } 
                continue;
            }

            // Handle character literals
            if (char === "'" && !inStringLiteral) {
                if (token !== "") {
                    this.categorizeToken(token, lineNumber);
                    token = "";
                }
                
                let charToken = "'";
                i++;
                while (i < source.length && (source[i] !== "'" || source[i-1] === '\\')) {
                    charToken += source[i];
                    i++;
                }
                if (i < source.length) charToken += "'";
                
                this.addToken('Character Literal', charToken, lineNumber);
                this.statistics.constants++;
                continue;
            }

            // Handle preprocessor directives
            if (char === '#' && (i === 0 || source[i-1] === '\n')) {
                if (token !== "") {
                    this.categorizeToken(token, lineNumber);
                    token = "";
                }
                
                let preprocessor = "#";
                i++;
                while (i < source.length && source[i] !== '\n') {
                    preprocessor += source[i];
                    i++;
                }
                
                this.addToken('Preprocessor', preprocessor.trim(), lineNumber);
                this.statistics.preprocessor++;
                continue;
            }

            // Handle punctuation and operators
            if (this.isPunctuation(char) || this.couldBeOperator(char)) {
                if (token !== "") {
                    this.categorizeToken(token, lineNumber);
                    token = "";
                }

                // Check for multi-character operators
                let operator = char;
                if (this.operators.has(char + nextChar)) {
                    operator = char + nextChar;
                    i++;
                } else if (i < source.length - 2 && this.operators.has(char + nextChar + source[i + 2])) {
                    operator = char + nextChar + source[i + 2];
                    i += 2;
                }

                if (this.operators.has(operator)) {
                    this.addToken('Operator', operator, lineNumber);
                    this.statistics.operators++;
                } else if (this.punctuation.has(operator)) {
                    this.addToken('Punctuation', operator, lineNumber);
                    this.statistics.punctuation++;
                }
                continue;
            }

            // Handle whitespace
            if (/\s/.test(char)) {
                if (token !== "") {
                    this.categorizeToken(token, lineNumber);
                    token = "";
                }
                continue;
            }

            token += char;
        }

        // Handle the last token
        if (token !== "") {
            this.categorizeToken(token, lineNumber);
        }

        return this.tokens;
    }

    // Helper methods
    isPunctuation(char) {
        return this.punctuation.has(char);
    }

    couldBeOperator(char) {
        return /[+\-*\/%=<>!&|^~]/.test(char);
    }

    // Categorize individual tokens
    categorizeToken(token, lineNumber) {
        // Check if it's a keyword
        if (this.keywords.has(token)) {
            this.addToken('Keyword', token, lineNumber);
            this.statistics.keywords++;
            return;
        }

        // Check if it's a numeric constant
        if (/^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$/.test(token) || 
            /^0[xX][0-9a-fA-F]+$/.test(token) || 
            /^0[0-7]+$/.test(token)) {
            this.addToken('Numeric Constant', token, lineNumber);
            this.statistics.constants++;
            return;
        }

        // Check if it's an identifier
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
            this.addToken('Identifier', token, lineNumber);
            this.statistics.identifiers++;
            return;
        }

        // If none of the above, it might be an unrecognized token
        this.addToken('Unknown', token, lineNumber);
    }

    addToken(type, value, lineNumber) {
        this.tokens.push({
            type: type,
            value: value,
            line: lineNumber
        });
    }

    resetStatistics() {
        this.statistics = {
            keywords: 0,
            identifiers: 0,
            operators: 0,
            constants: 0,
            punctuation: 0,
            strings: 0,
            preprocessor: 0
        };
    }

    // Main analysis function
    analyze(sourceCode) {
        // Step 1: Remove comments
        const withoutComments = this.removeComments(sourceCode);
        
        // Step 2: Tokenize
        const tokens = this.tokenize(sourceCode); // Use original source to preserve line numbers
        
        // Step 3: Clean for display
        const cleanedCode = this.removeWhitespace(withoutComments);

        return {
            tokens: tokens,
            processedCode: cleanedCode,
            statistics: this.statistics,
            originalWithoutComments: withoutComments
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Lexer;
}