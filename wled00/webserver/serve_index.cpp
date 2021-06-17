#include "wled.h"

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
  #ifndef WLED_DEBUG
  //this header name is misleading, "no-cache" will not disable cache,
  //it just revalidates on every load using the "If-None-Match" header with the last ETag value
  response->addHeader(F("Cache-Control"),"no-cache");
  #else
  response->addHeader(F("Cache-Control"),"no-store,max-age=0"); // prevent caching if debug build
  #endif
  response->addHeader(F("ETag"), String(VERSION));
}

void serveIndex(AsyncWebServerRequest *request)
{
    if (handleFileRead(request, "/index.htm"))
        return;

    if (handleIfNoneMatchCacheHeader(request))
        return;

    AsyncWebServerResponse *response = request->beginResponse_P(200, "text/html", PAGE_index, PAGE_index_L);

    response->addHeader(F("Content-Encoding"), "gzip");
    setStaticContentCacheHeaders(response);

    request->send(response);
}
