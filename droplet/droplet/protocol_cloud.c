#include "protocol_cloud.h"
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define JSMN_STRICT
#include <jsmn.h>

#define MAX_JSON_TOKENS 64

static const jsmntok_t* json_get_key(const unsigned char* data, const jsmntok_t* tokens, int num_tokens, const char* name)
{
    if (num_tokens < 1) {
        return NULL;
    }

    /* If top level object isn't an object, nothing we can do */
    if (tokens[0].type != JSMN_OBJECT) {
        return NULL;
    }

    size_t name_len = strlen(name);

    /*
     * First token was already checked to be an object, and the last token can't
     * be a key, so don't check them.
     */
    int i = 1;
    while (i < num_tokens - 1) {
        /* If we encounter a strange looking key, don't try to continue */
        if (tokens[i].type != JSMN_STRING || tokens[i].size < 1) {
            return NULL;
        }

        /* token.size is how many tokens are inside, not the length of the token itself */
        size_t token_length = tokens[i].end - tokens[i].start;
        if (token_length == name_len && memcmp(data + tokens[i].start, name, name_len) == 0) {
            return &tokens[i + 1];
        } else {
            i += 1 + tokens[i].size;
        }
    }

    return NULL;
}

static struct cloud_room* room_get_or_create(struct cloud_per_vhost_data* vhd, const unsigned char* name, size_t name_len)
{
    /* TODO: this is O(n), can easily be O(log n) or better */

    if (name_len > MAX_ROOM_NAME_LENGTH) {
        return NULL;
    }

    for (size_t i = 0; i < MAX_ROOMS; i++) {
        struct cloud_room* room = &vhd->rooms[i];
        if (room->active && room->name_len == name_len && memcmp(room->name, name, name_len) == 0) {
            return room;
        }
    }

    /*
     * Rooms can be deleted, so insert at the earliest spot to reduce average iterations
     * to get this room later.
     */
    for (size_t i = 0; i < MAX_ROOMS; i++) {
        struct cloud_room* room = &vhd->rooms[i];
        if (!room->active) {
            memcpy(room->name, name, name_len);
            room->name_len = name_len;

            /* variables are initialized as needed */
            room->variables_len = 0;

            for (size_t j = 0; j < MAX_ROOM_CONNECTIONS; j++) {
                room->connections[j] = NULL;
            }

            room->active = true;

            return room;
        }
    }

    return NULL;
}

static void room_free(struct cloud_room* room)
{
    for (size_t i = 0; i < MAX_ROOM_VARIABLES; i++) {
        resizable_buffer_free(&room->variables[i].value_buffer);
    }
}

static bool room_add_connection(struct cloud_room* room, struct cloud_per_session_data* pss)
{
    /* TODO: this is O(n), can easily be better */

    for (size_t i = 0; i < MAX_ROOM_CONNECTIONS; i++) {
        if (room->connections[i] == NULL) {
            room->connections[i] = pss;
            return true;
        }
    }

    return false;
}

static void room_remove_connection(struct cloud_room* room, struct cloud_per_session_data* pss)
{
    /* TODO: this is O(n), can easily be better */

    for (size_t i = 0; i < MAX_ROOM_CONNECTIONS; i++) {
        if (room->connections[i] == pss) {
            room->connections[i] = NULL;
            break;
        }
    }
}

/*
 * Returns the index of the variable in room->variables or -1 if it can't be found or created. The
 * index is returned instead of a pointer to the variable as the index is useful when updating the
 * sequence number of the client that sent this.
 */
static int room_get_or_create_variable_idx(struct cloud_room* room, const unsigned char* name, size_t name_len)
{
    /* TODO: this is O(n), can easily be O(log n) or better */

    if (name_len > MAX_VARIABLE_NAME_LENGTH) {
        return -1;
    }

    size_t i = 0;
    struct cloud_variable* var;
    for (; i < room->variables_len; i++) {
        var = &room->variables[i];
        if (var->name_len == name_len && memcmp(var->name, name, name_len) == 0) {
            return i;
        }
    }

    /* Variables are append only, so just add it after the last valid variable */
    if (i < MAX_ROOM_VARIABLES) {
        var = &room->variables[i];

        var->sequence_number = 0;

        memcpy(var->name, name, name_len);
        var->name_len = name_len;

        resizable_buffer_init(&var->value_buffer, MAX_VARIABLE_VALUE_LENGTH);

        room->variables_len++;

        return i;
    }

    return -1;
}

static bool handle_full_rx(struct cloud_per_vhost_data* vhd, struct cloud_per_session_data* pss, const unsigned char* data, size_t len)
{
    jsmn_parser parser;
    jsmntok_t tokens[MAX_JSON_TOKENS];
    jsmn_init(&parser);

    /* char* and unsigned char* are the same in memory */
    int num_tokens = jsmn_parse(&parser, (char*)data, len, tokens, MAX_JSON_TOKENS);
    if (num_tokens < 0) {
        lwsl_wsi_user(pss->wsi, "Invalid JSON: %d", num_tokens);
        return false;
    }

    lwsl_wsi_user(pss->wsi, "Parsed %d JSON tokens", num_tokens);

    const jsmntok_t* method_json = json_get_key(data, tokens, num_tokens, "method");
    if (method_json == NULL || method_json->type != JSMN_STRING) {
        lwsl_wsi_user(pss->wsi, "method missing or not a string");
        return false;
    }

    const unsigned char* method_data = data + method_json->start;
    size_t method_len = method_json->end - method_json->start;

    if (!pss->room) {
        /* Client must perform handshake */

        static const char* handshake = "handshake";
        if (method_len != strlen(handshake) || memcmp(method_data, handshake, strlen(handshake)) != 0) {
            lwsl_wsi_user(pss->wsi, "method was not handshake");
            return false;
        }

        const jsmntok_t* user_json = json_get_key(data, tokens, num_tokens, "user");
        if (user_json == NULL || user_json->type != JSMN_STRING) {
            lwsl_wsi_user(pss->wsi, "handshake user missing or not a string");
            return false;
        }

        const jsmntok_t* project_id_json = json_get_key(data, tokens, num_tokens, "project_id");
        if (project_id_json == NULL || project_id_json->type != JSMN_STRING) {
            lwsl_wsi_user(pss->wsi, "handshake project_id missing or not a string");
            return false;
        }

        /* TODO: username validation */

        const unsigned char* project_id_data = data + project_id_json->start;
        size_t project_id_len = project_id_json->end - project_id_json->start;
        struct cloud_room* room = room_get_or_create(vhd, project_id_data, project_id_len);
        if (!room) {
            lwsl_wsi_user(pss->wsi, "Failed to find or create room");
            return false;
        }

        if (!room_add_connection(room, pss)) {
            lwsl_wsi_user(pss->wsi, "Failed to add to room");
            return false;
        }

        lwsl_wsi_user(pss->wsi, "Joined room");
        pss->room = room;

        /* Send initial variable status */
        pss->tx_due = true;
        lws_callback_on_writable(pss->wsi);

        return true;
    }

    static const char* set = "set";
    if (method_len != strlen(set) || memcmp(method_data, set, strlen(set)) != 0) {
        lwsl_wsi_user(pss->wsi, "method was not set");
        return false;
    }

    const jsmntok_t* name_json = json_get_key(data, tokens, num_tokens, "name");
    if (name_json == NULL || name_json->type != JSMN_STRING) {
        lwsl_wsi_user(pss->wsi, "name missing or not a string");
        return false;
    }

    const jsmntok_t* value_json = json_get_key(data, tokens, num_tokens, "value");
    if (value_json == NULL || (value_json->type != JSMN_STRING && value_json->type != JSMN_PRIMITIVE)) {
        lwsl_wsi_user(pss->wsi, "value missing or not a string or primitive");
        return false;
    }

    const unsigned char* name_data = data + name_json->start;
    size_t name_len = name_json->end - name_json->start;

    int variable_idx = room_get_or_create_variable_idx(pss->room, name_data, name_len);
    if (variable_idx < 0) {
        lwsl_wsi_user(pss->wsi, "Could not find or create variable: %d", variable_idx);
        return false;
    }

    struct cloud_variable* variable = &pss->room->variables[variable_idx];
    const unsigned char* value_data = data + value_json->start;
    size_t value_len = value_json->end - value_json->start;

    resizable_buffer_clear(&variable->value_buffer);
    enum resizable_buffer_error buffer_result = resizable_buffer_push(&variable->value_buffer, value_data, value_len);
    if (buffer_result != resizable_buffer_ok) {
        lwsl_wsi_user(pss->wsi, "Variable buffer push failed: %d", buffer_result);
        return false;
    }

    variable->sequence_number++;

    /* Don't need to send new value to the client that sent it */
    pss->variable_sequence_numbers[variable_idx] = variable->sequence_number;

    for (size_t i = 0; i < MAX_ROOM_CONNECTIONS; i++) {
        struct cloud_per_session_data* other_pss = pss->room->connections[i];
        if (other_pss != NULL && other_pss != pss) {
            other_pss->tx_due = true;
            lws_callback_on_writable(other_pss->wsi);
        }
    }

    return true;
}

int callback_cloud(struct lws* wsi, enum lws_callback_reasons reason, void* user, void* in, size_t len)
{
    switch (reason) {
    case LWS_CALLBACK_PROTOCOL_INIT: {
        struct lws_vhost* vhost = lws_get_vhost(wsi);
        lwsl_vhost_user(vhost, "Initializing cloud protocol");

        struct cloud_per_vhost_data* vhd = lws_protocol_vh_priv_zalloc(
            vhost,
            lws_get_protocol(wsi),
            sizeof(struct cloud_per_vhost_data));

        /*
         * Not necessary, but for clarity, we just need the rooms to be marked
         * as inactive right now. The rest will be initialized when a room is
         * actually created.
         */
        for (size_t i = 0; i < MAX_ROOMS; i++) {
            vhd->rooms[i].active = false;
        }

        return 0;
    }

    case LWS_CALLBACK_PROTOCOL_DESTROY: {
        lwsl_user("Destroying cloud protocol");

        struct cloud_per_vhost_data* vhd = (struct cloud_per_vhost_data*)lws_protocol_vh_priv_get(
            lws_get_vhost(wsi),
            lws_get_protocol(wsi));

        for (size_t i = 0; i < MAX_ROOMS; i++) {
            struct cloud_room* room = &vhd->rooms[i];
            if (room->active) {
                room_free(room);
            }
        }

        return 0;
    }

    case LWS_CALLBACK_ESTABLISHED: {
        lwsl_wsi_user(wsi, "Connection established");

        struct cloud_per_session_data* pss = (struct cloud_per_session_data*)user;
        pss->wsi = wsi;

        /*
         * The largest single legal message between client and server will have a maximum length
         * variable name and maximum length value. Add padding to account for JSON, LWS_PRE, etc.
         */
        size_t largest_single_update = MAX_VARIABLE_NAME_LENGTH + MAX_VARIABLE_VALUE_LENGTH + 100;
        resizable_buffer_init(&pss->rx_buffer, largest_single_update);
        resizable_buffer_init(&pss->tx_buffer, largest_single_update);

        pss->room = NULL;
        memset(&pss->variable_sequence_numbers, 0, sizeof(int) * MAX_ROOM_VARIABLES);

        return 0;
    }

    case LWS_CALLBACK_CLOSED: {
        lwsl_wsi_user(wsi, "Connection closed");

        struct cloud_per_session_data* pss = (struct cloud_per_session_data*)user;
        resizable_buffer_free(&pss->rx_buffer);
        resizable_buffer_free(&pss->tx_buffer);
        if (pss->room) {
            room_remove_connection(pss->room, pss);
        }

        return 0;
    }

    case LWS_CALLBACK_SERVER_WRITEABLE: {
        struct cloud_per_session_data* pss = (struct cloud_per_session_data*)user;

        /* Ignore WRITEABLE callbacks generated by LWS */
        if (!pss->tx_due) {
            lwsl_wsi_user(wsi, "Ignoring WRITEABLE");
            return 0;
        }
        pss->tx_due = false;

        resizable_buffer_clear(&pss->tx_buffer);
        resizable_buffer_push_uninit(&pss->tx_buffer, LWS_PRE);

        /*
         * Updated in the loop when a variable is successfully written to tx_buffer
         * Includes LWS_PRE
         */
        size_t truncate_to = 0;
        enum resizable_buffer_error buffer_result;

        for (size_t i = 0; i < pss->room->variables_len; i++) {
            struct cloud_variable* variable = &pss->room->variables[i];
            int our_sequence_number = pss->variable_sequence_numbers[i];
            int latest_sequence_number = variable->sequence_number;

            if (our_sequence_number != latest_sequence_number) {
                lwsl_wsi_user(wsi, "Variable %lu out of date %d != %d", i, our_sequence_number, latest_sequence_number);

                static const char* prefix = "{\"method\":\"set\",\"name\":\"";
                static const char* middle = "\",\"value\":";
                static const char* postfix = "}";
                static const char* newline = "\n";

                if (truncate_to > 0) {
                    buffer_result = resizable_buffer_push(&pss->tx_buffer, (unsigned char*)newline, strlen(newline));
                    if (buffer_result != resizable_buffer_ok) {
                        lwsl_wsi_user(wsi, "Failed to write newline: %d", buffer_result);
                        break;
                    }
                }

                buffer_result = resizable_buffer_push(&pss->tx_buffer, (unsigned char*)prefix, strlen(prefix));
                if (buffer_result != resizable_buffer_ok) {
                    lwsl_wsi_user(wsi, "Failed to write prefix: %d", buffer_result);
                    break;
                }

                buffer_result = resizable_buffer_push(&pss->tx_buffer, variable->name, variable->name_len);
                if (buffer_result != resizable_buffer_ok) {
                    lwsl_wsi_user(wsi, "Failed to write name: %d", buffer_result);
                    break;
                }

                buffer_result = resizable_buffer_push(&pss->tx_buffer, (unsigned char*)middle, strlen(middle));
                if (buffer_result != resizable_buffer_ok) {
                    lwsl_wsi_user(wsi, "Failed to write middle: %d", buffer_result);
                    break;
                }

                buffer_result = resizable_buffer_push(&pss->tx_buffer, variable->value_buffer.buffer, variable->value_buffer.length);
                if (buffer_result != resizable_buffer_ok) {
                    lwsl_wsi_user(wsi, "Failed to write value: %d", buffer_result);
                    break;
                }

                buffer_result = resizable_buffer_push(&pss->tx_buffer, (unsigned char*)postfix, strlen(postfix));
                if (buffer_result != resizable_buffer_ok) {
                    lwsl_wsi_user(wsi, "Failed to write postfix: %d", buffer_result);
                    break;
                }

                pss->variable_sequence_numbers[i] = latest_sequence_number;
                truncate_to = pss->tx_buffer.length;
            }
        }

        if (truncate_to > 0) {
            resizable_buffer_truncate(&pss->tx_buffer, truncate_to);
            lws_write(wsi, pss->tx_buffer.buffer + LWS_PRE, pss->tx_buffer.length - LWS_PRE, LWS_WRITE_TEXT);

            /*
             * If we successfully wrote at least once update but then hit an error, schedule another
             * update to try again. Note that if we hit an error writing the very first variable,
             * we shouldn't schedule immediately as that would make a busy loop.
             */
            if (buffer_result != resizable_buffer_ok) {
                lwsl_wsi_user(wsi, "Scheduling another WRITEABLE callback for leftover variables");
                pss->tx_due = true;
                lws_callback_on_writable(wsi);
            }
        }

        return 0;
    }

    case LWS_CALLBACK_RECEIVE: {
        struct cloud_per_vhost_data* vhd = (struct cloud_per_vhost_data*)lws_protocol_vh_priv_get(
            lws_get_vhost(wsi),
            lws_get_protocol(wsi));
        struct cloud_per_session_data* pss = (struct cloud_per_session_data*)user;

        if (lws_is_final_fragment(wsi)) {
            lwsl_wsi_user(wsi, "Received %lu bytes (final)", len);

            if (pss->rx_buffer.length == 0) {
                if (!handle_full_rx(vhd, pss, in, len)) {
                    lwsl_wsi_user(wsi, "RX handle w/o partial failed");
                    return -1;
                }
            } else {
                enum resizable_buffer_error buffer_result = resizable_buffer_push(&pss->rx_buffer, in, len);
                if (buffer_result != resizable_buffer_ok) {
                    resizable_buffer_clear(&pss->rx_buffer);
                    lwsl_wsi_user(wsi, "Final partial buffer push failed: %d", buffer_result);
                    return -1;
                }

                if (!handle_full_rx(vhd, pss, pss->rx_buffer.buffer, pss->rx_buffer.length)) {
                    resizable_buffer_clear(&pss->rx_buffer);
                    lwsl_wsi_user(wsi, "RX handle w/ partial failed");
                    return -1;
                }

                resizable_buffer_clear(&pss->rx_buffer);
            }
        } else {
            lwsl_wsi_user(wsi, "Received %lu bytes (partial)", len);

            enum resizable_buffer_error buffer_result = resizable_buffer_push(&pss->rx_buffer, in, len);
            if (buffer_result != resizable_buffer_ok) {
                lwsl_wsi_user(wsi, "Partial buffer push failed: %d", buffer_result);
                return -1;
            }
        }

        return 0;
    }

    default:
        break;
    }

    return lws_callback_http_dummy(wsi, reason, user, in, len);
}
