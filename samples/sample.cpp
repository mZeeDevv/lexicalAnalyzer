// This is a single-line comment
/* This is a 
   multi-line comment */

#include <iostream>

int main() {
    // Constants
    const int MAX_VALUE = 100;
    float pi = 3.14159;
    
    // Variables and operators
    int counter = 0;
    counter++;
    
    // Control structures with various operators
    while (counter <= MAX_VALUE) {
        if (counter % 2 == 0) {
            counter += 10;
        } else {
            counter *= 2;
        }
    }
    
    return 0;
}