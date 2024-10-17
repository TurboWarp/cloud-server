#include "username.h"
#include <stdio.h>
#include <string.h>

int main(int argc, const char** argv)
{
    if (argc < 2) {
        fprintf(stderr, "missing arguments\n");
        return 1;
    }

    username_init();

    /*
     * Usernames from argv will be null terminated, but they do not have to be null
     * terminated in general.
     */

    for (int i = 1; i < argc; i++) {
        printf("%s: %d\n", argv[i], username_validate((const unsigned char*)argv[i], strlen(argv[i])));
    }

    return 0;
}
