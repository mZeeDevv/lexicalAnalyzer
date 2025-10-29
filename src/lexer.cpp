#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <regex>
#include <set>

class Lexer {
private:
    std::set<std::string> keywords = {
        "auto", "break", "case", "char", "const", "continue", "default", "do",
        "double", "else", "enum", "extern", "float", "for", "goto", "if",
        "int", "long", "register", "return", "short", "signed", "sizeof", "static",
        "struct", "switch", "typedef", "union", "unsigned", "void", "volatile", "while"
    };

    std::set<std::string> operators = {
        "+", "-", "*", "/", "%", "=", "==", "!=", "<", ">", "<=", ">=",
        "&&", "||", "!", "&", "|", "^", "~", "<<", ">>", "+=", "-=", "*=",
        "/=", "%=", "&=", "|=", "^=", "<<=", ">>=", "++", "--", "->", "."
    };

public:
    // Remove comments (both single-line and multi-line)
    std::string removeComments(const std::string& source) {
        std::string result;
        bool inSingleLineComment = false;
        bool inMultiLineComment = false;
        
        for (size_t i = 0; i < source.length(); ++i) {
            if (inSingleLineComment) {
                if (source[i] == '\n') {
                    inSingleLineComment = false;
                    result += '\n';
                }
                continue;
            }
            
            if (inMultiLineComment) {
                if (i < source.length() - 1 && source[i] == '*' && source[i + 1] == '/') {
                    inMultiLineComment = false;
                    ++i;
                }
                continue;
            }
            
            if (i < source.length() - 1) {
                if (source[i] == '/' && source[i + 1] == '/') {
                    inSingleLineComment = true;
                    ++i;
                    continue;
                }
                if (source[i] == '/' && source[i + 1] == '*') {
                    inMultiLineComment = true;
                    ++i;
                    continue;
                }
            }
            
            if (!inSingleLineComment && !inMultiLineComment) {
                result += source[i];
            }
        }
        return result;
    }

    // Remove extra whitespace while preserving newlines
    std::string removeWhitespace(const std::string& source) {
        std::string result;
        bool lastWasSpace = true;  // Start true to trim leading spaces
        
        for (char c : source) {
            if (std::isspace(c)) {
                if (c == '\n') {
                    result += '\n';
                    lastWasSpace = true;
                } else if (!lastWasSpace) {
                    result += ' ';
                    lastWasSpace = true;
                }
            } else {
                result += c;
                lastWasSpace = false;
            }
        }
        return result;
    }

    // Recognize and categorize tokens
    void tokenize(const std::string& source) {
        std::string token;
        std::string currentLine;
        
        for (size_t i = 0; i < source.length(); ++i) {
            char c = source[i];
            
            // Handle operators
            if (ispunct(c)) {
                if (!token.empty()) {
                    categorizeToken(token);
                    token.clear();
                }
                
                std::string op;
                op += c;
                if (i + 1 < source.length()) {
                    std::string doubleOp = op + source[i + 1];
                    if (operators.find(doubleOp) != operators.end()) {
                        op = doubleOp;
                        ++i;
                    }
                }
                
                if (operators.find(op) != operators.end()) {
                    std::cout << "Operator: " << op << std::endl;
                }
                continue;
            }

            // Handle whitespace
            if (std::isspace(c)) {
                if (!token.empty()) {
                    categorizeToken(token);
                    token.clear();
                }
                if (c == '\n') {
                    std::cout << std::endl;
                }
                continue;
            }

            token += c;
        }
        
        // Handle the last token
        if (!token.empty()) {
            categorizeToken(token);
        }
    }

private:
    // Categorize individual tokens
    void categorizeToken(const std::string& token) {
        // Check if it's a keyword
        if (keywords.find(token) != keywords.end()) {
            std::cout << "Keyword: " << token << std::endl;
            return;
        }

        // Check if it's a constant (number)
        if (std::regex_match(token, std::regex("^[0-9]+(\\.[0-9]+)?$"))) {
            std::cout << "Constant: " << token << std::endl;
            return;
        }

        // Check if it's an identifier
        if (std::regex_match(token, std::regex("^[a-zA-Z_][a-zA-Z0-9_]*$"))) {
            std::cout << "Identifier: " << token << std::endl;
            return;
        }
    }
};

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <source_file>" << std::endl;
        return 1;
    }

    std::ifstream file(argv[1]);
    if (!file.is_open()) {
        std::cerr << "Error: Could not open file " << argv[1] << std::endl;
        return 1;
    }

    // Read the entire file into a string
    std::string source((std::istreambuf_iterator<char>(file)),
                       std::istreambuf_iterator<char>());
    file.close();

    Lexer lexer;
    
    // Process the source code
    std::cout << "Processing file: " << argv[1] << "\n\n";
    
    // Remove comments first
    source = lexer.removeComments(source);
    
    // Remove extra whitespace
    source = lexer.removeWhitespace(source);
    
    // Tokenize and categorize
    std::cout << "Tokens:\n";
    std::cout << "-------\n";
    lexer.tokenize(source);

    return 0;
}