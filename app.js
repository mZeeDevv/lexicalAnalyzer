// Initialize the lexer
const lexer = new Lexer();

// DOM elements - will be initialized after DOM loads
let cppInput, analyzeBtn, clearBtn, loadSampleBtn, tokenOutput, processedOutput, statisticsOutput;
let tabButtons, tabContents;

// Sample C++ code
const sampleCode = `// Sample C++ program with various features
#include <iostream>
#include <string>

/* Multi-line comment
   demonstrating lexical analysis */

int main() {
    // Variable declarations
    const int MAX_SIZE = 100;
    float pi = 3.14159;
    std::string message = "Hello, World!";
    char grade = 'A';
    
    // Arithmetic operations
    int x = 10, y = 20;
    int sum = x + y;
    int product = x * y;
    
    // Conditional statements
    if (sum > product) {
        std::cout << "Sum is greater" << std::endl;
    } else if (sum == product) {
        std::cout << "They are equal" << std::endl;
    } else {
        std::cout << "Product is greater" << std::endl;
    }
    
    // Loop with various operators
    for (int i = 0; i < MAX_SIZE; i++) {
        if (i % 2 == 0) {
            sum += i;
        } else {
            sum *= 2;
        }
        
        // Bitwise operations
        int shifted = i << 1;
        int masked = i & 0xFF;
    }
    
    return 0;
}`;

// Initialize DOM elements and event listeners after DOM loads
function initializeApp() {
    console.log('Initializing app...');
    
    // Get DOM elements
    cppInput = document.getElementById('cppInput');
    analyzeBtn = document.getElementById('analyzeBtn');
    clearBtn = document.getElementById('clearBtn');
    loadSampleBtn = document.getElementById('loadSampleBtn');
    tokenOutput = document.getElementById('tokenOutput');
    processedOutput = document.getElementById('processedOutput');
    statisticsOutput = document.getElementById('statisticsOutput');
    tabButtons = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    
    // Check if critical elements exist
    console.log('Critical elements check:', {
        cppInput: !!cppInput,
        analyzeBtn: !!analyzeBtn,
        tokenOutput: !!tokenOutput,
        tokenCategories: !!document.getElementById('tokenCategories')
    });

    // Event listeners
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeCode);
    if (clearBtn) clearBtn.addEventListener('click', clearInput);
    if (loadSampleBtn) loadSampleBtn.addEventListener('click', loadSample);
    if (cppInput) cppInput.addEventListener('keydown', handleKeyDown);

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Set initial placeholder content with checks
    if (tokenOutput) showPlaceholder(tokenOutput, 'Click "Analyze Code" to see token analysis');
    if (processedOutput) showPlaceholder(processedOutput, 'Processed code will appear here');
    if (statisticsOutput) showPlaceholder(statisticsOutput, 'Code statistics will appear here');
    
    // Focus on input
    if (cppInput) cppInput.focus();
}

// Functions
function analyzeCode() {
    const code = cppInput.value.trim();
    
    if (!code) {
        showPlaceholder(tokenOutput, 'Please enter some C++ code to analyze');
        return;
    }

    // Show loading state
    analyzeBtn.innerHTML = '<div class="loading"></div> Analyzing...';
    analyzeBtn.disabled = true;

    // Simulate processing time for better UX
    setTimeout(() => {
        try {
            const result = lexer.analyze(code);
            displayTokens(result.tokens);
            displayProcessedCode(result.originalWithoutComments);
            displayStatistics(result.statistics);
            
            // Reset button state
            analyzeBtn.innerHTML = '🚀 Analyze Code';
            analyzeBtn.disabled = false;
        } catch (error) {
            console.error('Analysis error:', error);
            showPlaceholder(tokenOutput, 'Error analyzing code: ' + error.message);
            analyzeBtn.innerHTML = '🚀 Analyze Code';
            analyzeBtn.disabled = false;
        }
    }, 500);
}

function displayTokens(tokens) {
    // Get fresh references to ensure elements exist
    const currentTokenOutput = document.getElementById('tokenOutput');
    const tokenCategories = document.getElementById('tokenCategories');
    
    if (!currentTokenOutput) {
        console.error('tokenOutput element not found');
        return;
    }
    
    if (!tokenCategories) {
        console.error('tokenCategories element not found');
        return;
    }
    
    const placeholder = currentTokenOutput.querySelector('.placeholder');
    
    if (tokens.length === 0) {
        showPlaceholder(currentTokenOutput, 'No tokens found in the code');
        return;
    }

    // Hide placeholder and show categories
    if (placeholder) placeholder.style.display = 'none';
    tokenCategories.style.display = 'block';

    // Group tokens by type and count occurrences
    const groupedTokens = groupTokensByType(tokens);

    // Display each category
    displayTokenCategory('keywords', groupedTokens.keywords, 'Keyword');
    displayTokenCategory('identifiers', groupedTokens.identifiers, 'Identifier');
    displayTokenCategory('operators', groupedTokens.operators, 'Operator');
    displayTokenCategory('constants', groupedTokens.constants, 'Numeric Constant');
    displayTokenCategory('strings', groupedTokens.strings, 'String/Character Literal');
    displayTokenCategory('preprocessor', groupedTokens.preprocessor, 'Preprocessor');
    displayTokenCategory('punctuation', groupedTokens.punctuation, 'Punctuation');
}

function groupTokensByType(tokens) {
    const groups = {
        keywords: new Map(),
        identifiers: new Map(),
        operators: new Map(),
        constants: [],
        strings: [],
        preprocessor: [],
        punctuation: new Map()
    };

    tokens.forEach(token => {
        switch (token.type) {
            case 'Keyword':
                addToGroup(groups.keywords, token);
                break;
            case 'Identifier':
                addToGroup(groups.identifiers, token);
                break;
            case 'Operator':
                addToGroup(groups.operators, token);
                break;
            case 'Numeric Constant':
                groups.constants.push(token);
                break;
            case 'String Literal':
            case 'Character Literal':
                groups.strings.push(token);
                break;
            case 'Preprocessor':
                groups.preprocessor.push(token);
                break;
            case 'Punctuation':
                addToGroup(groups.punctuation, token);
                break;
        }
    });

    return groups;
}

function addToGroup(group, token) {
    if (group.has(token.value)) {
        const existing = group.get(token.value);
        existing.lines.push(token.line);
        existing.count++;
    } else {
        group.set(token.value, {
            value: token.value,
            lines: [token.line],
            count: 1
        });
    }
}

function displayTokenCategory(categoryId, tokens, tokenType) {
    const category = document.getElementById(`${categoryId}Category`);
    const tbody = document.getElementById(`${categoryId}Body`);
    
    // Add null checks to prevent errors
    if (!category || !tbody) {
        console.warn(`Category elements not found for: ${categoryId}`);
        return;
    }
    
    const countSpan = category.querySelector('.token-count');
    
    // Set category data attribute for styling
    category.setAttribute('data-category', categoryId);
    
    let html = '';
    let totalCount = 0;

    if (tokens instanceof Map) {
        // For grouped tokens (keywords, identifiers, operators, punctuation)
        if (tokens.size === 0) {
            category.classList.add('empty');
            tbody.innerHTML = '<tr><td colspan="3" class="empty-message">No ' + tokenType.toLowerCase() + 's found</td></tr>';
            if (countSpan) countSpan.textContent = '(0)';
            return;
        }
        
        category.classList.remove('empty');
        
        // Sort by token value for better readability
        const sortedTokens = Array.from(tokens.values()).sort((a, b) => a.value.localeCompare(b.value));
        
        sortedTokens.forEach(tokenData => {
            totalCount += tokenData.count;
            const lineNumbers = [...new Set(tokenData.lines)].sort((a, b) => a - b);
            
            html += `
                <tr>
                    <td><span class="token-value-cell">${escapeHtml(tokenData.value)}</span></td>
                    <td><span class="line-numbers">${lineNumbers.join(', ')}</span></td>
                    <td><span class="occurrence-count">${tokenData.count}</span></td>
                </tr>
            `;
        });
        
    } else {
        // For individual tokens (constants, strings, preprocessor)
        if (tokens.length === 0) {
            category.classList.add('empty');
            const colspan = categoryId === 'preprocessor' ? '2' : '3';
            tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-message">No ${tokenType.toLowerCase()}s found</td></tr>`;
            if (countSpan) countSpan.textContent = '(0)';
            return;
        }
        
        category.classList.remove('empty');
        totalCount = tokens.length;
        
        tokens.forEach(token => {
            if (categoryId === 'preprocessor') {
                html += `
                    <tr>
                        <td><span class="token-value-cell">${escapeHtml(token.value)}</span></td>
                        <td><span class="line-numbers">${token.line}</span></td>
                    </tr>
                `;
            } else {
                // For constants and strings, determine the specific type
                let specificType = token.type;
                if (token.type === 'Numeric Constant') {
                    if (token.value.includes('.') || token.value.includes('e') || token.value.includes('E')) {
                        specificType = 'Float';
                    } else if (token.value.startsWith('0x') || token.value.startsWith('0X')) {
                        specificType = 'Hexadecimal';
                    } else if (token.value.startsWith('0') && token.value.length > 1 && !/[89.]/.test(token.value)) {
                        specificType = 'Octal';
                    } else {
                        specificType = 'Integer';
                    }
                }
                
                html += `
                    <tr>
                        <td><span class="token-value-cell">${escapeHtml(token.value)}</span></td>
                        <td><span class="token-type-cell">${specificType}</span></td>
                        <td><span class="line-numbers">${token.line}</span></td>
                    </tr>
                `;
            }
        });
    }

    tbody.innerHTML = html;
    if (countSpan) {
        countSpan.textContent = `(${totalCount})`;
    }
}

function displayProcessedCode(processedCode) {
    if (!processedCode.trim()) {
        showPlaceholder(processedOutput, 'No processed code to display');
        return;
    }

    processedOutput.innerHTML = `
        <div class="processed-code">${escapeHtml(processedCode)}</div>
    `;
}

function displayStatistics(stats) {
    const html = `
        <div class="statistics-grid">
            <div class="stat-card">
                <span class="stat-number">${stats.keywords}</span>
                <div class="stat-label">Keywords</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.identifiers}</span>
                <div class="stat-label">Identifiers</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.operators}</span>
                <div class="stat-label">Operators</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.constants}</span>
                <div class="stat-label">Constants</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.strings}</span>
                <div class="stat-label">String Literals</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.preprocessor}</span>
                <div class="stat-label">Preprocessor</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.punctuation}</span>
                <div class="stat-label">Punctuation</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${Object.values(stats).reduce((a, b) => a + b, 0)}</span>
                <div class="stat-label">Total Tokens</div>
            </div>
        </div>
    `;

    statisticsOutput.innerHTML = html;
}

function showPlaceholder(element, message) {
    if (!element) {
        console.warn('Cannot show placeholder: element is null');
        return;
    }
    
    // Instead of replacing all innerHTML, just show/hide placeholder and categories
    let placeholder = element.querySelector('.placeholder');
    let tokenCategories = element.querySelector('#tokenCategories');
    
    if (!placeholder) {
        // Create placeholder if it doesn't exist
        placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        element.appendChild(placeholder);
    }
    
    placeholder.textContent = message;
    placeholder.style.display = 'block';
    
    if (tokenCategories) {
        tokenCategories.style.display = 'none';
    }
}

function clearInput() {
    if (cppInput) cppInput.value = '';
    if (tokenOutput) showPlaceholder(tokenOutput, 'Click "Analyze Code" to see token analysis');
    if (processedOutput) showPlaceholder(processedOutput, 'Processed code will appear here');
    if (statisticsOutput) showPlaceholder(statisticsOutput, 'Code statistics will appear here');
    if (cppInput) cppInput.focus();
}

function loadSample() {
    cppInput.value = sampleCode;
    cppInput.focus();
}

function switchTab(tabName) {
    // Remove active class from all tabs and contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function handleKeyDown(event) {
    // Allow Ctrl+Enter to analyze
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        analyzeCode();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is loaded - with additional safety checks
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeApp, 100);
    });
} else {
    // DOM is already loaded
    setTimeout(initializeApp, 100);
}