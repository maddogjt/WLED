#pragma once
#include <Arduino.h>
#include <inttypes.h>

class AsyncWebServerRequest;
void serveMessage(AsyncWebServerRequest *request, uint16_t code, const String &headl, const String &subl = "", byte optionT = 255);
