#include "serve_new_index.h"
#include "wled.h"
#include "html_new_ui.h"

static bool handleIfNoneMatchCacheHeader(AsyncWebServerRequest *request)
{
    AsyncWebHeader *header = request->getHeader("If-None-Match");
    if (header && header->value() == String(VERSION))
    {
        request->send(304);
        return true;
    }
    return false;
}

static void setStaticContentCacheHeaders(AsyncWebServerResponse *response)
{
    response->addHeader(F("Cache-Control"), "no-cache");
    response->addHeader(F("ETag"), String(VERSION));
}

void serveNewIndex(AsyncWebServerRequest *request)
{
    if (handleFileRead(request, "/index.htm"))
        return;

    if (handleIfNoneMatchCacheHeader(request))
        return;

    auto url = request->url();
    AsyncWebServerResponse *response = nullptr;

    if (url.indexOf("index.css") > 0)
    {
        response = request->beginResponse_P(200, "text/css", PAGE_new_index_css, PAGE_new_index_css_length);
    }
    else if (url.indexOf("index.bundle.js") > 0)
    {
        response = request->beginResponse_P(200, "text/javascript", PAGE_new_index_bundle_js, PAGE_new_index_bundle_js_length);
    }
    else
    {
        response = request->beginResponse_P(200, "text/html", PAGE_new_index_html, PAGE_new_index_html_length);
    }

    response->addHeader(F("Content-Encoding"), "gzip");
    setStaticContentCacheHeaders(response);

    request->send(response);
}
