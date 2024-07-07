#pragma once

#include <stdbool.h>
#include <stdlib.h>

enum resizable_buffer_error {
    resizable_buffer_ok = 0,
    resizable_buffer_full = 1,
    resizable_buffer_oom = 2
};

struct resizable_buffer {
    /* Index in buffer after the end of the data */
    size_t length;

    /* Size of the buffer */
    size_t capacity;

    /* Maximum capacity of the buffer */
    size_t max_capacity;

    /* malloc()'d, may be NULL if no data */
    unsigned char* buffer;
};

/*
 * Initialize empty resizable_buffer with given max capacity.
 */
void resizable_buffer_init(struct resizable_buffer* rb, size_t max_capacity);

/*
 * Expand the data's length without initializing data
 */
enum resizable_buffer_error resizable_buffer_push_uninit(struct resizable_buffer* rb, const size_t len);

/*
 * Copy data to the back of the buffer
 */
enum resizable_buffer_error resizable_buffer_push(struct resizable_buffer* rb, const unsigned char* in, const size_t len);

/*
 * Set's a buffer's length to zero. Does not zero or free() the backing buffer.
 */
void resizable_buffer_clear(struct resizable_buffer* rb);

/*
 * Shrink a buffer to a specific size. Does not zero or free() now-unused memory.
 */
void resizable_buffer_truncate(struct resizable_buffer* rb, size_t len);

/*
 * Print debug information about a buffer
 */
void resizable_buffer_debug_print(const struct resizable_buffer* rb);

/*
 * Free the memory used by the resizable_buffer, but does not free(rb)
 * You can later call resizable_buffer_init on the same rb and it will work
 */
void resizable_buffer_free(struct resizable_buffer* rb);
