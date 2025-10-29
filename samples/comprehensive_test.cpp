// Single-line comment test
/* Multi-line comment test
   with nested /* comment */

#include <iostream>
#include <string>

// Testing different types of constants
#define MAX_SIZE 100
const int DECIMAL = 42;
const int HEX = 0xFF;       // Hexadecimal
const int OCTAL = 0777;     // Octal
const float PI = 3.14159;
const double E = 2.71828e-10;  // Scientific notation
const char CHAR_TEST = 'A';
const char ESCAPE_CHAR = '\n';

// Testing string literals
std::string str1 = "Hello, World!";
std::string str2 = "String with \"escaped quotes\"";
std::string str3 = "String with \n newline";

int main() {
    // Testing operators
    int a = 10, b = 20;
    
    // Arithmetic operators
    int sum = a + b;
    int diff = a - b;
    int mult = a * b;
    int div = b / a;
    int mod = b % a;

    // Increment/Decrement
    a++;
    b--;
    ++a;
    --b;

    // Assignment operators
    a += 5;
    b -= 3;
    a *= 2;
    b /= 4;
    a %= 3;

    // Bitwise operators
    int bit_and = a & b;
    int bit_or = a | b;
    int bit_xor = a ^ b;
    int bit_not = ~a;
    int left_shift = a << 2;
    int right_shift = b >> 1;

    // Logical operators
    bool logical_and = (a > 0) && (b < 30);
    bool logical_or = (a < 0) || (b > 30);
    bool logical_not = !logical_and;

    // Relational operators
    bool equal = (a == b);
    bool not_equal = (a != b);
    bool less = (a < b);
    bool greater = (a > b);
    bool less_equal = (a <= b);
    bool greater_equal = (a >= b);

    // Special operators
    int* ptr = &a;
    int val = *ptr;
    int arr[5] = {1, 2, 3, 4, 5};
    int first = arr[0];

    // Testing struct
    struct Point {
        int x;
        int y;
    } point;
    point.x = 10;
    
    // Testing error cases
    // @invalid_symbol  // This should generate an error
    // 42invalid       // This should generate an error
    
    return 0;
}