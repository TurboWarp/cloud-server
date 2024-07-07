#include "resizable_buffer.h"
#include <stdio.h>
#include <string.h>

static size_t min(const size_t a, const size_t b)
{
    if (a > b) {
        return b;
    }
    return a;
}

void resizable_buffer_init(struct resizable_buffer* rb, size_t max_capacity)
{
    rb->length = 0;
    rb->capacity = 0;
    rb->max_capacity = max_capacity;
    rb->buffer = NULL;
}

enum resizable_buffer_error resizable_buffer_push_uninit(struct resizable_buffer* rb, const size_t len)
{
    if (len == 0) {
        return resizable_buffer_ok;
    }

    if (len > rb->max_capacity) {
        return resizable_buffer_full;
    }

    if (!rb->buffer) {
        // We assume there will be more data
        size_t new_capacity = min(rb->max_capacity, len * 2);

        rb->buffer = malloc(new_capacity);
        if (!rb->buffer) {
            return resizable_buffer_oom;
        }
        rb->capacity = new_capacity;
    }

    size_t needed_capacity = rb->length + len;
    if (needed_capacity > rb->max_capacity) {
        return resizable_buffer_full;
    }

    if (needed_capacity > rb->capacity) {
        // Grow exponentially to reduce avoid constantly reallocating
        size_t new_capacity = rb->capacity;
        while (new_capacity < needed_capacity) {
            new_capacity *= 2;
        }
        new_capacity = min(new_capacity, rb->max_capacity);

        unsigned char* new_buffer = realloc(rb->buffer, new_capacity);
        if (new_buffer == NULL) {
            return resizable_buffer_oom;
        }

        rb->buffer = new_buffer;
        rb->capacity = new_capacity;
    }

    rb->length += len;
    return resizable_buffer_ok;
}

enum resizable_buffer_error resizable_buffer_push(struct resizable_buffer* rb, const unsigned char* in, const size_t len)
{
    enum resizable_buffer_error error = resizable_buffer_push_uninit(rb, len);
    if (error != resizable_buffer_ok) {
        return error;
    }

    memcpy(rb->buffer + rb->length - len, in, len);
    return resizable_buffer_ok;
}

void resizable_buffer_clear(struct resizable_buffer* rb)
{
    rb->length = 0;
}

void resizable_buffer_truncate(struct resizable_buffer* rb, size_t len)
{
    rb->length = len;
}

void resizable_buffer_debug_print(const struct resizable_buffer* rb)
{
    printf("length: %lu capacity: %lu max_capacity: %lu buffer: %p\n",
        rb->length, rb->capacity, rb->max_capacity, rb->buffer);

    if (rb->buffer && rb->length != 0) {
        for (size_t i = 0; i < rb->length; i++) {
            char* it = (char*)(rb->buffer) + i;
            printf("char: %c hex: %02x\n", *it, *it);
        }
    }
}

void resizable_buffer_free(struct resizable_buffer* rb)
{
    if (rb->buffer) {
        free(rb->buffer);
        rb->buffer = NULL;
        rb->buffer = 0;
        rb->length = 0;
        rb->capacity = 0;
    }
}
