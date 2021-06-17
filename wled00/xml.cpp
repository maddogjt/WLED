#include "wled.h"
#include "utils/temp_buffer.h"
/*
 * Sending XML status files to client
 */

//macro to convert F to const
#define SET_F(x)  (const char*)F(x)

//build XML response to HTTP /win API request
void XML_response(AsyncWebServerRequest *request, char *dest, size_t destSize)
{
  const size_t bufSize = (dest == nullptr) ? 1024 : 1;
  char sbuf[bufSize]; //allocate local buffer if none passed
  TempBuffer tempBuf(dest ? dest : sbuf, dest ? destSize : bufSize);

  tempBuf.append(SET_F("<?xml version=\"1.0\" ?><vs><ac>"));
  tempBuf.appendi((nightlightActive && nightlightMode > NL_MODE_SET) ? briT : bri);
  tempBuf.append(SET_F("</ac>"));

  for (int i = 0; i < 3; i++)
  {
    tempBuf.append("<cl>");
    tempBuf.appendi(col[i]);
    tempBuf.append("</cl>");
  }
  for (int i = 0; i < 3; i++)
  {
    tempBuf.append("<cs>");
    tempBuf.appendi(colSec[i]);
    tempBuf.append("</cs>");
  }
  tempBuf.append(SET_F("<ns>"));
  tempBuf.appendi(notifyDirect);
  tempBuf.append(SET_F("</ns><nr>"));
  tempBuf.appendi(receiveNotifications);
  tempBuf.append(SET_F("</nr><nl>"));
  tempBuf.appendi(nightlightActive);
  tempBuf.append(SET_F("</nl><nf>"));
  tempBuf.appendi(nightlightMode > NL_MODE_SET);
  tempBuf.append(SET_F("</nf><nd>"));
  tempBuf.appendi(nightlightDelayMins);
  tempBuf.append(SET_F("</nd><nt>"));
  tempBuf.appendi(nightlightTargetBri);
  tempBuf.append(SET_F("</nt><fx>"));
  tempBuf.appendi(effectCurrent);
  tempBuf.append(SET_F("</fx><sx>"));
  tempBuf.appendi(effectSpeed);
  tempBuf.append(SET_F("</sx><ix>"));
  tempBuf.appendi(effectIntensity);
  tempBuf.append(SET_F("</ix><fp>"));
  tempBuf.appendi(effectPalette);
  tempBuf.append(SET_F("</fp><wv>"));
  if (strip.isRgbw) {
    tempBuf.appendi(col[3]);
  } else {
    tempBuf.append("-1");
  }
  tempBuf.append(SET_F("</wv><ws>"));
  tempBuf.appendi(colSec[3]);
  tempBuf.append(SET_F("</ws><ps>"));
  tempBuf.appendi((currentPreset < 1) ? 0 : currentPreset);
  tempBuf.append(SET_F("</ps><cy>"));
  tempBuf.appendi(currentPlaylist > 0);
  tempBuf.append(SET_F("</cy><ds>"));
  tempBuf.append(serverDescription);
  if (realtimeMode)
  {
    tempBuf.append(SET_F(" (live)"));
  }
  tempBuf.append(SET_F("</ds><ss>"));
  tempBuf.appendi(strip.getMainSegmentId());
  tempBuf.append(SET_F("</ss></vs>"));
  if (request != nullptr)
    request->send(200, "text/xml", tempBuf.buffer());
}

void URL_response(AsyncWebServerRequest *request)
{
  char sbuf[256];
  char s2buf[100];
  TempBuffer tempBuf(s2buf, 100);

  char s[16];
  tempBuf.append(SET_F("http://"));
  IPAddress localIP = Network.localIP();
  sprintf(s, "%d.%d.%d.%d", localIP[0], localIP[1], localIP[2], localIP[3]);
  tempBuf.append(s);

  tempBuf.append(SET_F("/win&A="));
  tempBuf.appendi(bri);
  tempBuf.append(SET_F("&CL=h"));
  for (int i = 0; i < 3; i++)
  {
   sprintf(s,"%02X", col[i]);
    tempBuf.append(s);
  }
  tempBuf.append(SET_F("&C2=h"));
  for (int i = 0; i < 3; i++)
  {
   sprintf(s,"%02X", colSec[i]);
    tempBuf.append(s);
  }
  tempBuf.append(SET_F("&FX="));
  tempBuf.appendi(effectCurrent);
  tempBuf.append(SET_F("&SX="));
  tempBuf.appendi(effectSpeed);
  tempBuf.append(SET_F("&IX="));
  tempBuf.appendi(effectIntensity);
  tempBuf.append(SET_F("&FP="));
  tempBuf.appendi(effectPalette);

  TempBuffer tempBuf2(sbuf, sizeof(sbuf));

  tempBuf2.append(SET_F("<html><body><a href=\""));
  tempBuf2.append(s2buf);
  tempBuf2.append(SET_F("\" target=\"_blank\">"));
  tempBuf2.append(s2buf);
  tempBuf2.append(SET_F("</a></body></html>"));

  if (request != nullptr)
    request->send(200, "text/html", sbuf);
}

//append a numeric setting to string buffer
void sappend(TempBuffer &tempBuf, char stype, const char *key, int val)
{
  char ds[] = "d.Sf.";

  switch(stype)
  {
    case 'c': //checkbox
      tempBuf.append(ds);
      tempBuf.append(key);
      tempBuf.append(".checked=");
      tempBuf.appendi(val);
      tempBuf.append(";");
      break;
    case 'v': //numeric
      tempBuf.append(ds);
      tempBuf.append(key);
      tempBuf.append(".value=");
      tempBuf.appendi(val);
      tempBuf.append(";");
      break;
    case 'i': //selectedIndex
      tempBuf.append(ds);
      tempBuf.append(key);
      tempBuf.append(SET_F(".selectedIndex="));
      tempBuf.appendi(val);
      tempBuf.append(";");
      break;
  }
}

//append a string setting to buffer
void sappends(TempBuffer &tempBuf, char stype, const char *key, char *val)
{
  switch(stype)
  {
    case 's': { //string (we can interpret val as char*)
      tempBuf.append("d.Sf.");
      tempBuf.append(key);
      tempBuf.append(".value=\"");
      //convert "%" to "%%" to make EspAsyncWebServer happy
      char buf[130];
      uint8_t len = strlen(val) +1;
      uint8_t s = 0;
      for (uint8_t i = 0; i < len; i++) {
        buf[i+s] = val[i];
        if (val[i] == '%') {
          s++; buf[i+s] = '%';
        }
      }

      tempBuf.append(buf);
      tempBuf.append("\";");
      break; }
    case 'm': //message
      tempBuf.append(SET_F("d.getElementsByClassName"));
      tempBuf.append(key);
      tempBuf.append(SET_F(".innerHTML=\""));
      tempBuf.append(val);
      tempBuf.append("\";");
      break;
  }
}


//get values for settings form in javascript
void getSettingsJS(SettingsPage settingsPage, char *dest, size_t destSize)
{
  byte subPage = (byte)settingsPage;
  //0: menu 1: wifi 2: leds 3: ui 4: sync 5: time 6: sec
  DEBUG_PRINT(F("settings resp"));
  DEBUG_PRINTLN(subPage);
  TempBuffer tempBuf(dest, destSize);

  if (subPage <1 || subPage >8) return;

  if (subPage == 1) {
    sappends(tempBuf, 's', SET_F("CS"), clientSSID);

    byte l = strlen(clientPass);
    char fpass[l+1]; //fill password field with ***
    fpass[l] = 0;
    memset(fpass,'*',l);
    sappends(tempBuf, 's', SET_F("CP"), fpass);

    char k[3]; k[2] = 0; //IP addresses
    for (int i = 0; i<4; i++)
    {
      k[1] = 48+i; //ascii 0,1,2,3
      k[0] = 'I';
      sappend(tempBuf, 'v', k, staticIP[i]);
      k[0] = 'G';
      sappend(tempBuf, 'v', k, staticGateway[i]);
      k[0] = 'S';
      sappend(tempBuf, 'v', k, staticSubnet[i]);
    }

    sappends(tempBuf, 's', SET_F("CM"), cmDNS);
    sappend(tempBuf, 'i', SET_F("AB"), apBehavior);
    sappends(tempBuf, 's', SET_F("AS"), apSSID);
    sappend(tempBuf, 'c', SET_F("AH"), apHide);

    l = strlen(apPass);
    char fapass[l+1]; //fill password field with ***
    fapass[l] = 0;
    memset(fapass,'*',l);
    sappends(tempBuf, 's', SET_F("AP"), fapass);

    sappend(tempBuf, 'v', SET_F("AC"), apChannel);
    sappend(tempBuf, 'c', SET_F("WS"), noWifiSleep);

    #ifdef WLED_USE_ETHERNET
    sappend(tempBuf, 'v', SET_F("ETH"), ethernetType);
    #else
    //hide ethernet setting if not compiled in
    tempBuf.append(SET_F("document.getElementById('ethd').style.display='none';"));
    #endif

    if (Network.isConnected()) //is connected
    {
      char s[32];
      IPAddress localIP = Network.localIP();
      sprintf(s, "%d.%d.%d.%d", localIP[0], localIP[1], localIP[2], localIP[3]);

      #if defined(ARDUINO_ARCH_ESP32) && defined(WLED_USE_ETHERNET)
      if (Network.isEthernet()) strcat_P(s ,SET_F(" (Ethernet)"));
      #endif
      sappends(tempBuf, 'm', SET_F("(\"sip\")[0]"), s);
    } else
    {
      sappends(tempBuf, 'm', SET_F("(\"sip\")[0]"), (char *)F("Not connected"));
    }

    if (WiFi.softAPIP()[0] != 0) //is active
    {
      char s[16];
      IPAddress apIP = WiFi.softAPIP();
      sprintf(s, "%d.%d.%d.%d", apIP[0], apIP[1], apIP[2], apIP[3]);
      sappends(tempBuf, 'm', SET_F("(\"sip\")[1]"), s);
    } else
    {
      sappends(tempBuf, 'm', SET_F("(\"sip\")[1]"), (char *)F("Not active"));
    }
  }

  if (subPage == 2) {
    char nS[8];

    // add reserved and usermod pins as d.um_p array
    DynamicJsonDocument doc(JSON_BUFFER_SIZE/2);
    JsonObject mods = doc.createNestedObject(F("um"));
    usermods.addToConfig(mods);
    tempBuf.append(SET_F("d.um_p=["));
    if (!mods.isNull()) {
      uint8_t i=0;
      for (JsonPair kv : mods) {
        if (!kv.value().isNull()) {
          // element is an JsonObject
          JsonObject obj = kv.value();
          if (obj["pin"] != nullptr) {
            if (obj["pin"].is<JsonArray>()) {
              JsonArray pins = obj["pin"].as<JsonArray>();
              for (JsonVariant pv : pins) {
                if (i++)
                  tempBuf.append(SET_F(","));
                tempBuf.appendi(pv.as<int>());
              }
            } else {
              if (i++)
                tempBuf.append(SET_F(","));
              tempBuf.appendi(obj["pin"].as<int>());
            }
          }
        }
      }
      if (i)
        tempBuf.append(SET_F(","));
      tempBuf.append(SET_F("6,7,8,9,10,11")); // flash memory pins
      #ifdef WLED_ENABLE_DMX
      tempBuf.append(SET_F(",2")); // DMX hardcoded pin
      #endif
      //Adalight / Serial in requires pin 3 to be unused. However, Serial input can not be prevented by WLED
      #ifdef WLED_DEBUG
      tempBuf.append(SET_F(",1")); // debug output (TX) pin
      #endif
      #if defined(ARDUINO_ARCH_ESP32) && defined(WLED_USE_PSRAM)
      if (psramFound())
        tempBuf.append(SET_F(",16,17")); // GPIO16 & GPIO17 reserved for SPI RAM
      #endif
      //TODO: add reservations for Ethernet shield pins
      #ifdef WLED_USE_ETHERNET
      #endif
    }
    tempBuf.append(SET_F("];"));

    // set limits
    tempBuf.append(SET_F("bLimits("));
    tempBuf.append(itoa(WLED_MAX_BUSSES, nS, 10));
    tempBuf.append(",");
    tempBuf.append(itoa(MAX_LEDS_PER_BUS, nS, 10));
    tempBuf.append(",");
    tempBuf.append(itoa(MAX_LED_MEMORY, nS, 10));
    tempBuf.append(SET_F(");"));

    tempBuf.append(SET_F("d.Sf.LC.max=")); //TODO Formula for max LEDs on ESP8266 depending on types. 500 DMA or 1500 UART (about 4kB mem usage)
    tempBuf.appendi(MAX_LEDS);
    tempBuf.append(";");

    sappend(tempBuf, 'v', SET_F("LC"), ledCount);

    for (uint8_t s = 0; s < busses.getNumBusses(); s++)
    {
      Bus* bus = busses.getBus(s);
      char lp[4] = "L0"; lp[2] = 48+s; lp[3] = 0; //ascii 0-9 //strip data pin
      char lc[4] = "LC"; lc[2] = 48+s; lc[3] = 0; //strip length
      char co[4] = "CO"; co[2] = 48+s; co[3] = 0; //strip color order
      char lt[4] = "LT"; lt[2] = 48+s; lt[3] = 0; //strip type
      char ls[4] = "LS"; ls[2] = 48+s; ls[3] = 0; //strip start LED
      char cv[4] = "CV"; cv[2] = 48+s; cv[3] = 0; //strip reverse
      char sl[4] = "SL"; sl[2] = 48+s; sl[3] = 0; //skip 1st LED
      tempBuf.append(SET_F("addLEDs(1);"));
      uint8_t pins[5];
      uint8_t nPins = bus->getPins(pins);
      for (uint8_t i = 0; i < nPins; i++) {
        lp[1] = 48+i;
        if (pinManager.isPinOk(pins[i]))
          sappend(tempBuf, 'v', lp, pins[i]);
      }
      sappend(tempBuf, 'v', lc, bus->getLength());
      sappend(tempBuf, 'v', lt, bus->getType());
      sappend(tempBuf, 'v', co, bus->getColorOrder());
      sappend(tempBuf, 'v', ls, bus->getStart());
      sappend(tempBuf, 'c', cv, bus->reversed);
      sappend(tempBuf, 'c', sl, bus->skippedLeds());
    }
    sappend(tempBuf, 'v', SET_F("MA"), strip.ablMilliampsMax);
    sappend(tempBuf, 'v', SET_F("LA"), strip.milliampsPerLed);
    if (strip.currentMilliamps)
    {
      tempBuf.printf("d.getElementsByClassName(\"pow\")[0].innerHTML=\"%dmA\";", strip.currentMilliamps);
    }

    sappend(tempBuf, 'v', SET_F("CA"), briS);
    sappend(tempBuf, 'v', SET_F("AW"), strip.rgbwMode);

    sappend(tempBuf, 'c', SET_F("BO"), turnOnAtBoot);
    sappend(tempBuf, 'v', SET_F("BP"), bootPreset);

    sappend(tempBuf, 'c', SET_F("GB"), strip.gammaCorrectBri);
    sappend(tempBuf, 'c', SET_F("GC"), strip.gammaCorrectCol);
    sappend(tempBuf, 'c', SET_F("TF"), fadeTransition);
    sappend(tempBuf, 'v', SET_F("TD"), transitionDelayDefault);
    sappend(tempBuf, 'c', SET_F("PF"), strip.paletteFade);
    sappend(tempBuf, 'v', SET_F("BF"), briMultiplier);
    sappend(tempBuf, 'v', SET_F("TB"), nightlightTargetBri);
    sappend(tempBuf, 'v', SET_F("TL"), nightlightDelayMinsDefault);
    sappend(tempBuf, 'v', SET_F("TW"), nightlightMode);
    sappend(tempBuf, 'i', SET_F("PB"), strip.paletteBlend);
    sappend(tempBuf, 'v', SET_F("RL"), rlyPin);
    sappend(tempBuf, 'c', SET_F("RM"), rlyMde);
    for (uint8_t i=0; i<WLED_MAX_BUTTONS; i++) {
      tempBuf.append(SET_F("addBtn("));
      tempBuf.append(itoa(i, nS, 10));
      tempBuf.append(",");
      tempBuf.append(itoa(btnPin[i], nS, 10));
      tempBuf.append(",");
      tempBuf.append(itoa(buttonType[i], nS, 10));
      tempBuf.append(SET_F(");"));
    }
    sappend(tempBuf, 'v', SET_F("TT"), touchThreshold);
    sappend(tempBuf, 'v', SET_F("IR"), irPin);
    sappend(tempBuf, 'v', SET_F("IT"), irEnabled);
  }

  if (subPage == 3)
  {
    sappends(tempBuf, 's', SET_F("DS"), serverDescription);
    sappend(tempBuf, 'c', SET_F("ST"), syncToggleReceive);
  }

  if (subPage == 4)
  {
    sappend(tempBuf, 'v', SET_F("UP"), udpPort);
    sappend(tempBuf, 'v', SET_F("U2"), udpPort2);
    sappend(tempBuf, 'c', SET_F("RB"), receiveNotificationBrightness);
    sappend(tempBuf, 'c', SET_F("RC"), receiveNotificationColor);
    sappend(tempBuf, 'c', SET_F("RX"), receiveNotificationEffects);
    sappend(tempBuf, 'c', SET_F("SD"), notifyDirectDefault);
    sappend(tempBuf, 'c', SET_F("SB"), notifyButton);
    sappend(tempBuf, 'c', SET_F("SH"), notifyHue);
    sappend(tempBuf, 'c', SET_F("SM"), notifyMacro);
    sappend(tempBuf, 'c', SET_F("S2"), notifyTwice);

    sappend(tempBuf, 'c', SET_F("NL"), nodeListEnabled);
    sappend(tempBuf, 'c', SET_F("NB"), nodeBroadcastEnabled);

    sappend(tempBuf, 'c', SET_F("RD"), receiveDirect);
    sappend(tempBuf, 'v', SET_F("EP"), e131Port);
    sappend(tempBuf, 'c', SET_F("ES"), e131SkipOutOfSequence);
    sappend(tempBuf, 'c', SET_F("EM"), e131Multicast);
    sappend(tempBuf, 'v', SET_F("EU"), e131Universe);
    sappend(tempBuf, 'v', SET_F("DA"), DMXAddress);
    sappend(tempBuf, 'v', SET_F("DM"), DMXMode);
    sappend(tempBuf, 'v', SET_F("ET"), realtimeTimeoutMs);
    sappend(tempBuf, 'c', SET_F("FB"), arlsForceMaxBri);
    sappend(tempBuf, 'c', SET_F("RG"), arlsDisableGammaCorrection);
    sappend(tempBuf, 'v', SET_F("WO"), arlsOffset);
    sappend(tempBuf, 'c', SET_F("AL"), alexaEnabled);
    sappends(tempBuf, 's', SET_F("AI"), alexaInvocationName);
    sappend(tempBuf, 'c', SET_F("SA"), notifyAlexa);
    sappends(tempBuf, 's', SET_F("BK"), (char *)((blynkEnabled) ? SET_F("Hidden") : ""));
    #ifndef WLED_DISABLE_BLYNK
    sappends(tempBuf, 's', SET_F("BH"), blynkHost);
    sappend(tempBuf, 'v', SET_F("BP"), blynkPort);
    #endif

    #ifdef WLED_ENABLE_MQTT
    sappend(tempBuf, 'c', SET_F("MQ"), mqttEnabled);
    sappends(tempBuf, 's', SET_F("MS"), mqttServer);
    sappend(tempBuf, 'v', SET_F("MQPORT"), mqttPort);
    sappends(tempBuf, 's', SET_F("MQUSER"), mqttUser);
    byte l = strlen(mqttPass);
    char fpass[l+1]; //fill password field with ***
    fpass[l] = 0;
    memset(fpass,'*',l);
    sappends(tempBuf, 's', SET_F("MQPASS"), fpass);
    sappends(tempBuf, 's', SET_F("MQCID"), mqttClientID);
    sappends(tempBuf, 's', SET_F("MD"), mqttDeviceTopic);
    sappends(tempBuf, 's', SET_F("MG"), mqttGroupTopic);
    sappend(tempBuf, 'c',SET_F("BM"),buttonPublishMqtt);
    #endif

    #ifndef WLED_DISABLE_HUESYNC
    sappend(tempBuf, 'v', SET_F("H0"), hueIP[0]);
    sappend(tempBuf, 'v', SET_F("H1"), hueIP[1]);
    sappend(tempBuf, 'v', SET_F("H2"), hueIP[2]);
    sappend(tempBuf, 'v', SET_F("H3"), hueIP[3]);
    sappend(tempBuf, 'v', SET_F("HL"), huePollLightId);
    sappend(tempBuf, 'v', SET_F("HI"), huePollIntervalMs);
    sappend(tempBuf, 'c', SET_F("HP"), huePollingEnabled);
    sappend(tempBuf, 'c', SET_F("HO"), hueApplyOnOff);
    sappend(tempBuf, 'c', SET_F("HB"), hueApplyBri);
    sappend(tempBuf, 'c', SET_F("HC"), hueApplyColor);
    char hueErrorString[25];
    switch (hueError)
    {
      case HUE_ERROR_INACTIVE     : strcpy(hueErrorString,(char*)F("Inactive"));                break;
      case HUE_ERROR_ACTIVE       : strcpy(hueErrorString,(char*)F("Active"));                  break;
      case HUE_ERROR_UNAUTHORIZED : strcpy(hueErrorString,(char*)F("Unauthorized"));            break;
      case HUE_ERROR_LIGHTID      : strcpy(hueErrorString,(char*)F("Invalid light ID"));        break;
      case HUE_ERROR_PUSHLINK     : strcpy(hueErrorString,(char*)F("Link button not pressed")); break;
      case HUE_ERROR_JSON_PARSING : strcpy(hueErrorString,(char*)F("JSON parsing error"));      break;
      case HUE_ERROR_TIMEOUT      : strcpy(hueErrorString,(char*)F("Timeout"));                 break;
      default: sprintf(hueErrorString,(char*)F("Bridge Error %i"),hueError);
    }
    
    sappends(tempBuf, 'm', SET_F("(\"sip\")[0]"), hueErrorString);
    #endif
  }

  if (subPage == 5)
  {
    sappend(tempBuf, 'c', SET_F("NT"), ntpEnabled);
    sappends(tempBuf, 's', SET_F("NS"), ntpServerName);
    sappend(tempBuf, 'c', SET_F("CF"), !useAMPM);
    sappend(tempBuf, 'i', SET_F("TZ"), currentTimezone);
    sappend(tempBuf, 'v', SET_F("UO"), utcOffsetSecs);
    char tm[32];
    dtostrf(longitude,4,2,tm);
    sappends(tempBuf, 's', SET_F("LN"), tm);
    dtostrf(latitude,4,2,tm);
    sappends(tempBuf, 's', SET_F("LT"), tm);
    getTimeString(tm);
    sappends(tempBuf, 'm', SET_F("(\"times\")[0]"), tm);
    if ((int)(longitude*10.) || (int)(latitude*10.)) {
      sprintf_P(tm, PSTR("Sunrise: %02d:%02d Sunset: %02d:%02d"), hour(sunrise), minute(sunrise), hour(sunset), minute(sunset));
      sappends(tempBuf, 'm', SET_F("(\"times\")[1]"), tm);
    }
    sappend(tempBuf, 'i', SET_F("OL"), overlayCurrent);
    sappend(tempBuf, 'v', SET_F("O1"), overlayMin);
    sappend(tempBuf, 'v', SET_F("O2"), overlayMax);
    sappend(tempBuf, 'v', SET_F("OM"), analogClock12pixel);
    sappend(tempBuf, 'c', SET_F("OS"), analogClockSecondsTrail);
    sappend(tempBuf, 'c', SET_F("O5"), analogClock5MinuteMarks);
    #ifndef WLED_DISABLE_CRONIXIE
    sappends(tempBuf, 's', SET_F("CX"), cronixieDisplay);
    sappend(tempBuf, 'c', SET_F("CB"), cronixieBacklight);
    #endif
    sappend(tempBuf, 'c', SET_F("CE"), countdownMode);
    sappend(tempBuf, 'v', SET_F("CY"), countdownYear);
    sappend(tempBuf, 'v', SET_F("CI"), countdownMonth);
    sappend(tempBuf, 'v', SET_F("CD"), countdownDay);
    sappend(tempBuf, 'v', SET_F("CH"), countdownHour);
    sappend(tempBuf, 'v', SET_F("CM"), countdownMin);
    sappend(tempBuf, 'v', SET_F("CS"), countdownSec);

    sappend(tempBuf, 'v', SET_F("A0"), macroAlexaOn);
    sappend(tempBuf, 'v', SET_F("A1"), macroAlexaOff);
    sappend(tempBuf, 'v', SET_F("MC"), macroCountdown);
    sappend(tempBuf, 'v', SET_F("MN"), macroNl);
    for (uint8_t i=0; i<WLED_MAX_BUTTONS; i++) {
      tempBuf.append(SET_F("addRow("));
      tempBuf.append(itoa(i, tm, 10));
      tempBuf.append(",");
      tempBuf.append(itoa(macroButton[i], tm, 10));
      tempBuf.append(",");
      tempBuf.append(itoa(macroLongPress[i], tm, 10));
      tempBuf.append(",");
      tempBuf.append(itoa(macroDoublePress[i], tm, 10));
      tempBuf.append(SET_F(");"));
    }

    char k[4];
    k[2] = 0; //Time macros
    for (int i = 0; i<10; i++)
    {
      k[1] = 48+i; //ascii 0,1,2,3
      if (i < 8)
      {
        k[0] = 'H';
        sappend(tempBuf, 'v', k, timerHours[i]);
      }
      k[0] = 'N';
      sappend(tempBuf, 'v', k, timerMinutes[i]);
      k[0] = 'T';
      sappend(tempBuf, 'v', k, timerMacro[i]);
      k[0] = 'W';
      sappend(tempBuf, 'v', k, timerWeekday[i]);
    }
  }

  if (subPage == 6)
  {
    sappend(tempBuf, 'c', SET_F("NO"), otaLock);
    sappend(tempBuf, 'c', SET_F("OW"), wifiLock);
    sappend(tempBuf, 'c', SET_F("AO"), aOtaEnabled);
    tempBuf.printf(
        "d.getElementsByClassName(\"sip\")[0].innerHTML=\"WLED %s (build %d)\";",
        versionString,
        VERSION);
  }
  
  #ifdef WLED_ENABLE_DMX // include only if DMX is enabled
  if (subPage == 7)
  {
    sappend(tempBuf, 'v', SET_F("PU"), e131ProxyUniverse);
    
    sappend(tempBuf, 'v', SET_F("CN"), DMXChannels);
    sappend(tempBuf, 'v', SET_F("CG"), DMXGap);
    sappend(tempBuf, 'v', SET_F("CS"), DMXStart);
    sappend(tempBuf, 'v', SET_F("SL"), DMXStartLED);
    
    sappend(tempBuf, 'i', SET_F("CH1"), DMXFixtureMap[0]);
    sappend(tempBuf, 'i', SET_F("CH2"), DMXFixtureMap[1]);
    sappend(tempBuf, 'i', SET_F("CH3"), DMXFixtureMap[2]);
    sappend(tempBuf, 'i', SET_F("CH4"), DMXFixtureMap[3]);
    sappend(tempBuf, 'i', SET_F("CH5"), DMXFixtureMap[4]);
    sappend(tempBuf, 'i', SET_F("CH6"), DMXFixtureMap[5]);
    sappend(tempBuf, 'i', SET_F("CH7"), DMXFixtureMap[6]);
    sappend(tempBuf, 'i', SET_F("CH8"), DMXFixtureMap[7]);
    sappend(tempBuf, 'i', SET_F("CH9"), DMXFixtureMap[8]);
    sappend(tempBuf, 'i', SET_F("CH10"), DMXFixtureMap[9]);
    sappend(tempBuf, 'i', SET_F("CH11"), DMXFixtureMap[10]);
    sappend(tempBuf, 'i', SET_F("CH12"), DMXFixtureMap[11]);
    sappend(tempBuf, 'i', SET_F("CH13"), DMXFixtureMap[12]);
    sappend(tempBuf, 'i', SET_F("CH14"), DMXFixtureMap[13]);
    sappend(tempBuf, 'i', SET_F("CH15"), DMXFixtureMap[14]);
  }
  #endif

  if (subPage == 8) //usermods
  {
    tempBuf.append(SET_F("numM="));
    tempBuf.appendi(usermods.getModCount());
    tempBuf.append(";");
  }

  tempBuf.append(SET_F("}</script>"));
}
