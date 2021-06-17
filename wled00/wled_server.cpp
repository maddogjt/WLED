#include "wled.h"
#include "webserver/serve_index.h"
#include "webserver/serve_message.h"
#include "webserver/serve_dmx.h"
#include "webserver/serve_settings.h"
#include "webserver/serve_new_index.h"

/*
 * Integrated HTTP web server page declarations
 */

//Is this an IP?
static bool isIp(String str) {
  for (size_t i = 0; i < str.length(); i++) {
    int c = str.charAt(i);
    if (c != '.' && (c < '0' || c > '9')) {
      return false;
    }
  }
  return true;
}

void handleUpload(AsyncWebServerRequest *request, const String& filename, size_t index, uint8_t *data, size_t len, bool final){
  if(!index){
    request->_tempFile = WLED_FS.open(filename, "w");
    DEBUG_PRINT("Uploading ");
    DEBUG_PRINTLN(filename);
    if (filename == "/presets.json") presetsModifiedTime = toki.second();
  }
  if (len) {
    request->_tempFile.write(data,len);
  }
  if(final){
    request->_tempFile.close();
    request->send(200, "text/plain", F("File Uploaded!"));
  }
}

static bool captivePortal(AsyncWebServerRequest *request)
{
  if (ON_STA_FILTER(request)) return false; //only serve captive in AP mode
  String hostH;
  if (!request->hasHeader("Host")) return false;
  hostH = request->getHeader("Host")->value();
  
  if (!isIp(hostH) && hostH.indexOf("wled.me") < 0 && hostH.indexOf(cmDNS) < 0) {
    DEBUG_PRINTLN("Captive portal");
    AsyncWebServerResponse *response = request->beginResponse(302);
    response->addHeader(F("Location"), F("http://4.3.2.1"));
    request->send(response);
    return true;
  }
  return false;
}

static void serveIndexOrWelcome(AsyncWebServerRequest *request)
{
  if (!showWelcomePage)
  {
    serveIndex(request);
  }
  else
  {
    serveSettings(request, false);
  }
}

void initServer()
{
  //CORS compatiblity
  DefaultHeaders::Instance().addHeader(F("Access-Control-Allow-Origin"), "*");
  DefaultHeaders::Instance().addHeader(F("Access-Control-Allow-Methods"), "*");
  DefaultHeaders::Instance().addHeader(F("Access-Control-Allow-Headers"), "*");

 #ifdef WLED_ENABLE_WEBSOCKETS
    server.on("/liveview", HTTP_GET, [](AsyncWebServerRequest *request){
      request->send_P(200, "text/html", PAGE_liveviewws);
    });
 #else
    server.on("/liveview", HTTP_GET, [](AsyncWebServerRequest *request){
      request->send_P(200, "text/html", PAGE_liveview);
    });
  #endif
  
  //settings page
  server.on("/settings", HTTP_GET, [](AsyncWebServerRequest *request){
    serveSettings(request, false);
  });
  
  server.on("/favicon.ico", HTTP_GET, [](AsyncWebServerRequest *request){
    if(!handleFileRead(request, "/favicon.ico"))
    {
      request->send_P(200, "image/x-icon", favicon, 156);
    }
  });
  
  server.on("/sliders", HTTP_GET, [](AsyncWebServerRequest *request){
    serveIndex(request);
  });
  
  server.on("/welcome", HTTP_GET, [](AsyncWebServerRequest *request){
    serveSettings(request, false);
  });
  
  server.on("/reset", HTTP_GET, [](AsyncWebServerRequest *request){
    serveMessage(request, 200,F("Rebooting now..."),F("Please wait ~10 seconds..."),129);
    doReboot = true;
  });
  
  server.on("/settings", HTTP_POST, [](AsyncWebServerRequest *request){
    serveSettings(request, true);
  });

  server.on("/json", HTTP_GET, [](AsyncWebServerRequest *request){
    serveJson(request);
  });

  AsyncCallbackJsonWebHandler* handler = new AsyncCallbackJsonWebHandler("/json", [](AsyncWebServerRequest *request) {
    bool verboseResponse = false;
    bool isConfig = false;
    { //scope JsonDocument so it releases its buffer
      DynamicJsonDocument jsonBuffer(JSON_BUFFER_SIZE);
      DeserializationError error = deserializeJson(jsonBuffer, (uint8_t*)(request->_tempObject));
      JsonObject root = jsonBuffer.as<JsonObject>();
      if (error || root.isNull()) {
        request->send(400, "application/json", F("{\"error\":9}")); return;
      }
      const String& url = request->url();
      isConfig = url.indexOf("cfg") > -1;
      if (!isConfig) {
        #ifdef WLED_DEBUG
          DEBUG_PRINTLN(F("Serialized HTTP"));
          serializeJson(root,Serial);
          DEBUG_PRINTLN();
        #endif
        fileDoc = &jsonBuffer;  // used for applying presets (presets.cpp)
        verboseResponse = deserializeState(root);
        fileDoc = nullptr;
      } else {
        verboseResponse = deserializeConfig(root); //use verboseResponse to determine whether cfg change should be saved immediately
      }
    }
    if (verboseResponse) {
      if (!isConfig) {
        serveJson(request); return; //if JSON contains "v"
      } else {
        serializeConfig(); //Save new settings to FS
      }
    } 
    request->send(200, "application/json", F("{\"success\":true}"));
  });
  server.addHandler(handler);

  server.on("/version", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", (String)VERSION);
    });
    
  server.on("/uptime", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", (String)millis());
    });
    
  server.on("/freeheap", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", (String)ESP.getFreeHeap());
    });
  
  server.on("/u", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", PAGE_usermod);
    });
    
  server.on("/url", HTTP_GET, [](AsyncWebServerRequest *request){
    URL_response(request);
    });
    
  server.on("/teapot", HTTP_GET, [](AsyncWebServerRequest *request){
    serveMessage(request, 418, F("418. I'm a teapot."), F("(Tangible Embedded Advanced Project Of Twinkling)"), 254);
    });

  server.on("/upload", HTTP_POST, [](AsyncWebServerRequest *request) {},
        [](AsyncWebServerRequest *request, const String& filename, size_t index, uint8_t *data,
                      size_t len, bool final) {handleUpload(request, filename, index, data, len, final);}
  );

  //if OTA is allowed
  if (!otaLock){
    #ifdef WLED_ENABLE_FS_EDITOR
     #ifdef ARDUINO_ARCH_ESP32
      server.addHandler(new SPIFFSEditor(WLED_FS));//http_username,http_password));
     #else
      server.addHandler(new SPIFFSEditor("","",WLED_FS));//http_username,http_password));
     #endif
    #else
    server.on("/edit", HTTP_GET, [](AsyncWebServerRequest *request){
      serveMessage(request, 501, "Not implemented", F("The FS editor is disabled in this build."), 254);
    });
    #endif
    //init ota page
    #ifndef WLED_DISABLE_OTA
    server.on("/update", HTTP_GET, [](AsyncWebServerRequest *request){
      request->send_P(200, "text/html", PAGE_update);
    });
    
    server.on("/update", HTTP_POST, [](AsyncWebServerRequest *request){
      if (Update.hasError())
      {
        String ec(F("Please check your file and retry! ec: "));
        ec.concat(Update.getError());
        serveMessage(request, 500, F("Failed updating firmware!"), ec, 254); return;
      }
      serveMessage(request, 200, F("Successfully updated firmware!"), F("Please wait while the module reboots..."), 131); 
      doReboot = true;
    },[](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final){
      if(!index){
        DEBUG_PRINTLN(F("OTA Update Start"));
        #ifdef ESP8266
        Update.runAsync(true);
        #endif
        Update.begin(UPDATE_SIZE_UNKNOWN);
      }
      if(!Update.hasError()) Update.write(data, len);
      if(final){
        if(Update.end(true)){
          DEBUG_PRINTLN(F("Update Success"));
        } else {
          DEBUG_PRINTLN(F("Update Failed"));
        }
      }
    });
    
    #else
    server.on("/update", HTTP_GET, [](AsyncWebServerRequest *request){
      serveMessage(request, 501, "Not implemented", F("OTA updates are disabled in this build."), 254);
    });
    #endif
  } else
  {
    server.on("/edit", HTTP_GET, [](AsyncWebServerRequest *request){
      serveMessage(request, 500, "Access Denied", F("Please unlock OTA in security settings!"), 254);
    });
    server.on("/update", HTTP_GET, [](AsyncWebServerRequest *request){
      serveMessage(request, 500, "Access Denied", F("Please unlock OTA in security settings!"), 254);
    });
  }


  #ifdef WLED_ENABLE_DMX
  server.on("/dmxmap", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", PAGE_dmxmap     , dmxProcessor);
  });
  #else
  server.on("/dmxmap", HTTP_GET, [](AsyncWebServerRequest *request){
    serveMessage(request, 501, "Not implemented", F("DMX support is not enabled in this build."), 254);
  });
  #endif
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    if (captivePortal(request)) return;
    serveIndexOrWelcome(request);
  });

  server.on("/new", HTTP_GET, [](AsyncWebServerRequest *request) {
    serveNewIndex(request);
  });

  #ifdef WLED_ENABLE_WEBSOCKETS
  server.addHandler(&ws);
  #endif
  
  //called when the url is not defined here, ajax-in; get-settings
  server.onNotFound([](AsyncWebServerRequest *request){
    DEBUG_PRINTLN("Not-Found HTTP call:");
    DEBUG_PRINTLN("URI: " + request->url());
    if (captivePortal(request)) return;

    //make API CORS compatible
    if (request->method() == HTTP_OPTIONS)
    {
      AsyncWebServerResponse *response = request->beginResponse(200);
      response->addHeader(F("Access-Control-Max-Age"), F("7200"));
      request->send(response);
      return;
    }
    
    if(handleSet(request, request->url())) return;
    #ifndef WLED_DISABLE_ALEXA
    if(espalexa.handleAlexaApiCall(request)) return;
    #endif
    if(handleFileRead(request, request->url())) return;
    request->send_P(404, "text/html", PAGE_404);
  });
}
