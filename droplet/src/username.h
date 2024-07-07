#pragma once

#include <stdbool.h>
#include <stddef.h>

/*
 * Initialize memory spaces used by the username subsystem. Call once.
 */
void username_init();

/*
 * Check if a username is valid. Username is not null terminated.
 * Returns true if valid.
 */
bool username_validate(const unsigned char* username, size_t len);
