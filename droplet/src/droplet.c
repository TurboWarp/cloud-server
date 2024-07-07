#include "protocol_cloud.h"
#include <signal.h>
#include <stdbool.h>
#include <string.h>

static struct lws_protocols protocols[] = {
    LWS_PLUGIN_PROTOCOL_CLOUD,
    LWS_PROTOCOL_LIST_TERM
};

static bool interrupted;

static void sigint_handler(int sig)
{
    interrupted = true;
}

static int get_port(int argc, const char** argv)
{
    const char* p = lws_cmdline_option(argc, argv, "-p");
    if (p) {
        return atoi(p);
    }
    return 9082;
}

static const char* get_mount_origin(int argc, const char** argv)
{
    const char* w = lws_cmdline_option(argc, argv, "-w");
    if (w) {
        return w;
    }
    return "./playground";
}

int main(int argc, const char** argv)
{
    signal(SIGINT, sigint_handler);

#ifndef NDEBUG
    lws_set_log_level(LLL_USER | LLL_ERR | LLL_WARN | LLL_NOTICE, NULL);
#else
    lws_set_log_level(LLL_ERR | LLL_WARN | LLL_NOTICE, NULL);
#endif

    struct lws_http_mount mount = { 0 };
    mount.mountpoint = "/";
    mount.origin = get_mount_origin(argc, argv);
    mount.def = "index.html";
    mount.origin_protocol = LWSMPRO_FILE;
    mount.mountpoint_len = 1;

    struct lws_context_creation_info info = { 0 };
    info.port = get_port(argc, argv);
    info.mounts = &mount;
    info.protocols = protocols;

    lwsl_user("Starting on http://localhost:%d | ws://localhost:%d\n", info.port, info.port);
    lwsl_user("Serving HTTP requests from %s\n", mount.origin);

    struct lws_context* context = lws_create_context(&info);
    if (!context) {
        lwsl_err("lws_create_context failed\n");
        return 1;
    }

    lwsl_cx_user(context, "Entering event loop");
    int n = 0;
    while (n >= 0 && !interrupted) {
        n = lws_service(context, 0);
    }

    lwsl_cx_user(context, "Event loop interrupted");
    lws_context_destroy(context);
    return 0;
}
