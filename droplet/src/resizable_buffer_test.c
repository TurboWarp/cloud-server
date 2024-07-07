#include "resizable_buffer.h"
#include <string.h>

int main()
{
    struct resizable_buffer rb;
    resizable_buffer_init(&rb, 1024);
    resizable_buffer_debug_print(&rb);

    char* str1 = "Hello, ";
    resizable_buffer_push(&rb, (unsigned char*)str1, strlen(str1) + 1);
    resizable_buffer_debug_print(&rb);

    char* str2 = "world!";
    resizable_buffer_push(&rb, (unsigned char*)str2, strlen(str2) + 1);
    resizable_buffer_debug_print(&rb);

    resizable_buffer_clear(&rb);
    resizable_buffer_debug_print(&rb);

    resizable_buffer_free(&rb);

    return 0;
}
