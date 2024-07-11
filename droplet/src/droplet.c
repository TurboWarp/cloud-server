#include "protocol_cloud.h"
#include "username.h"
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

static const char* get_unix_socket(int argc, const char** argv)
{
    return lws_cmdline_option(argc, argv, "-u");
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

#ifndef LWS_WITHOUT_EXTENSIONS
static const struct lws_extension extensions[] = {
    { "permessage-deflate",
        lws_extension_callback_pm_deflate,
        "permessage-deflate" },
    { NULL, NULL, NULL /* terminator */ }
};
#endif

int main(int argc, const char** argv)
{
    signal(SIGINT, sigint_handler);

    username_init();

#ifndef NDEBUG
    lws_set_log_level(LLL_USER | LLL_ERR | LLL_WARN | LLL_NOTICE, NULL);
#else
    lws_set_log_level(LLL_ERR | LLL_WARN, NULL);
#endif

    struct lws_http_mount mount = { 0 };
    mount.mountpoint = "/";
    mount.origin = get_mount_origin(argc, argv);
    mount.def = "index.html";
    mount.origin_protocol = LWSMPRO_FILE;
    mount.mountpoint_len = 1;

    struct lws_context_creation_info info = { 0 };
    info.mounts = &mount;
    info.protocols = protocols;

#ifndef LWS_WITHOUT_EXTENSIONS
    info.extensions = extensions;
#endif

    info.ka_time = 120;
    info.ka_probes = 30;
    info.ka_interval = 4;

    const char* unix_socket_path = get_unix_socket(argc, argv);
    if (unix_socket_path) {
        info.options |= LWS_SERVER_OPTION_UNIX_SOCK;
        info.iface = unix_socket_path;
        lwsl_user("Starting on unix socket %s\n", unix_socket_path);
    } else {
        info.port = get_port(argc, argv);
        lwsl_user("Starting on http://localhost:%d | ws://localhost:%d\n", info.port, info.port);
    }

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
