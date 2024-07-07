#include "protocol_cloud.h"
#include <signal.h>
#include <stdbool.h>
#include <string.h>

static struct lws_protocols protocols[] = {
    LWS_PLUGIN_PROTOCOL_CLOUD,
    LWS_PROTOCOL_LIST_TERM
};

static const struct lws_http_mount mount = {
    .mount_next = NULL,
    .mountpoint = "/",
    .origin = "./playground",
    .def = "index.html",
    .protocol = NULL,
    .cgienv = NULL,
    .extra_mimetypes = NULL,
    .interpret = NULL,
    .cgi_timeout = 0,
    .cache_max_age = 0,
    .auth_mask = 0,
    .cache_reusable = 0,
    .cache_revalidate = 0,
    .cache_intermediaries = 0,
    .cache_no = 0,
    .origin_protocol = LWSMPRO_FILE,
    .mountpoint_len = 1,
    .basic_auth_login_file = NULL,
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

int main(int argc, const char** argv)
{
    signal(SIGINT, sigint_handler);

#ifndef NDEBUG
    lws_set_log_level(LLL_USER | LLL_ERR | LLL_WARN | LLL_NOTICE, NULL);
#else
    lws_set_log_level(LLL_ERR | LLL_WARN | LLL_NOTICE, NULL);
#endif

    struct lws_context_creation_info info = { 0 };
    info.port = get_port(argc, argv);
    info.mounts = &mount;
    info.protocols = protocols;

    lwsl_user("Starting on http://localhost:%d | ws://localhost:%d", info.port, info.port);
    struct lws_context* context = lws_create_context(&info);
    if (!context) {
        lwsl_err("lws init failed\n");
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
