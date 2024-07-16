#pragma once

#include "resizable_buffer.h"
#include <libwebsockets.h>
#include <stdbool.h>

#define MAX_ROOMS 2048
#define MAX_ROOM_NAME_LENGTH 128
#define MAX_ROOM_CONNECTIONS 128
#define MAX_ROOM_VARIABLES 128
#define MAX_VARIABLE_NAME_LENGTH 128
#define MAX_VARIABLE_VALUE_LENGTH 100000

struct cloud_per_session_data {
    struct lws* wsi;

    /* Buffer for partially received messages */
    struct resizable_buffer rx_buffer;

    /* Whether we have requested a WRITEABLE callback from LWS */
    bool tx_due;

    /* Buffer for partially sent messages */
    struct resizable_buffer tx_buffer;

    /* The room connected to, only use if status is status_active */
    struct cloud_room* room;

    int variable_sequence_numbers[MAX_ROOM_VARIABLES];
};

struct cloud_variable {
    /* Incremented each time the variable is modified. */
    int sequence_number;

    /* Not null terminated */
    unsigned char name[MAX_VARIABLE_NAME_LENGTH];
    size_t name_len;

    struct resizable_buffer value_buffer;
};

struct cloud_room {
    bool active;

    /* Not null terminated */
    unsigned char* name[MAX_ROOM_NAME_LENGTH];
    size_t name_len;

    struct cloud_variable variables[MAX_ROOM_VARIABLES];
    size_t variables_len;

    struct cloud_per_session_data* connections[MAX_ROOM_CONNECTIONS];
};

struct cloud_per_vhost_data {
    struct cloud_room rooms[MAX_ROOMS];
};

int callback_cloud(struct lws* wsi, enum lws_callback_reasons reason, void* user, void* in, size_t len);

#define LWS_PLUGIN_PROTOCOL_CLOUD                       \
    {                                                   \
        "cloud",                                        \
            callback_cloud,                             \
            sizeof(struct cloud_per_session_data),      \
            1 << 18, /* TODO: tune with prod numbers */ \
            0, NULL, 0                                  \
    }
