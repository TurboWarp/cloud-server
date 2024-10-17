#include "username.h"
#include <string.h>

/* Both inclusive */
static const int MIN_LENGTH = 1;
static const int MAX_LENGTH = 20;

static const char* ALLOWED = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-0123456789";

static bool lookup_table[256];

void username_init()
{
    size_t len = strlen(ALLOWED);
    for (size_t i = 0; i < len; i++) {
        lookup_table[(unsigned char)ALLOWED[i]] = true;
    }
}

bool username_validate(const unsigned char* username, size_t len)
{
    if (len < MIN_LENGTH || len > MAX_LENGTH) {
        return false;
    }

    for (size_t i = 0; i < len; i++) {
        unsigned char ch = username[i];
        if (!lookup_table[ch]) {
            return false;
        }
    }

    return true;
}
