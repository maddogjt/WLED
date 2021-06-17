#include "serve_settings.h"
#include "wled.h"
#include "serve_message.h"

#include <functional>
#include "html_settings.h"

/*
 * Integrated HTTP web server page declarations
 */

static String settingsProcessor(const String &var, SettingsPage settingsPage)
{
    if (var == "CSS")
    {
    char buf[2048];
    buf[0] = 0;
    getSettingsJS(settingsPage, buf, sizeof(buf));
    return String(buf);
/*
        DynamicJsonDocument doc(JSON_BUFFER_SIZE);
        auto root = doc.createNestedObject();
        serializeSettings(root);
            // getSettingsJS(settingsPage, buf, sizeof(buf));
        serializeJson(root, buf, sizeof(buf));///
        return String("var settings = JSON.parse(document.getElementById('settings').innerHTML);"
                      "console.log(settings); UseSettings(settings);"
                      "}</script><script type=\"application/json\" id=\"settings\">") +
               String(buf) + String("</script>");*/
  }
  
  #ifdef WLED_ENABLE_DMX

  if (var == "DMXMENU") {
    return String(F("<form action=/settings/dmx><button type=submit>DMX Output</button></form>"));
  }
  
  #endif
    if (var == "SCSS")
        return String(FPSTR(PAGE_settingsCss));
  return String();
}


void serveSettings(AsyncWebServerRequest* request, bool post)
{
  SettingsPage settingsPage = SettingsPage::None;
  const String& url = request->url();
  if (url.indexOf("sett") >= 0) 
  {
    if      (url.indexOf("wifi") > 0) settingsPage = SettingsPage::Wifi;
    else if (url.indexOf("leds") > 0) settingsPage = SettingsPage::Leds;
    else if (url.indexOf("ui")   > 0) settingsPage = SettingsPage::UI;
    else if (url.indexOf("sync") > 0) settingsPage = SettingsPage::Sync;
    else if (url.indexOf("time") > 0) settingsPage = SettingsPage::Time;
    else if (url.indexOf("sec")  > 0) settingsPage = SettingsPage::Security;
    #ifdef WLED_ENABLE_DMX // include only if DMX is enabled
    else if (url.indexOf("dmx")  > 0) settingsPage = SettingsPage::DMX;
    #endif
    else if (url.indexOf("um")  > 0) settingsPage = SettingsPage::UserMods;
  } else {
      settingsPage = SettingsPage::Welcome; //welcome page
  }

  if (settingsPage == SettingsPage::Wifi && wifiLock && otaLock)
  {
    serveMessage(request, 500, "Access Denied", F("Please unlock OTA in security settings!"), 254); return;
  }

  if (post) { //settings/set POST request, saving
    if (settingsPage != SettingsPage::Wifi || !(wifiLock && otaLock)) handleSettingsSet(request, settingsPage);

    char s[32];
    char s2[45] = "";

    switch (settingsPage) {
      case SettingsPage::Wifi: strcpy_P(s, PSTR("WiFi")); strcpy_P(s2, PSTR("Please connect to the new IP (if changed)")); forceReconnect = true; break;
      case SettingsPage::Leds: strcpy_P(s, PSTR("LED")); break;
      case SettingsPage::UI: strcpy_P(s, PSTR("UI")); break;
      case SettingsPage::Sync: strcpy_P(s, PSTR("Sync")); break;
      case SettingsPage::Time: strcpy_P(s, PSTR("Time")); break;
      case SettingsPage::Security: strcpy_P(s, PSTR("Security")); strcpy_P(s2, PSTR("Rebooting, please wait ~10 seconds...")); break;
      case SettingsPage::DMX: strcpy_P(s, PSTR("DMX")); break;
      case SettingsPage::UserMods: strcpy_P(s, PSTR("Usermods")); break;
    }

    strcat_P(s, PSTR(" settings saved."));
    if (!s2[0]) strcpy_P(s2, PSTR("Redirecting..."));

    if (!doReboot) serveMessage(request, 200, s, s2, (settingsPage == SettingsPage::Wifi || settingsPage == SettingsPage::Security) ? 129 : 1);
    if (settingsPage == SettingsPage::Security) doReboot = true;

    return;
  }
  
  #ifdef WLED_DISABLE_MOBILE_UI //disable welcome page if not enough storage
   if (settingsPage == 255) {serveIndex(request); return;}
  #endif

  using namespace std::placeholders;
  
  auto boundProcessor = std::bind(settingsProcessor, _1, settingsPage);
  switch (settingsPage)
  {
    case SettingsPage::Wifi:   request->send_P(200, "text/html", PAGE_settings_wifi, boundProcessor); break;
    case SettingsPage::Leds:   request->send_P(200, "text/html", PAGE_settings_leds, boundProcessor); break;
    case SettingsPage::UI:   request->send_P(200, "text/html", PAGE_settings_ui  , boundProcessor); break;
    case SettingsPage::Sync:   request->send_P(200, "text/html", PAGE_settings_sync, boundProcessor); break;
    case SettingsPage::Time:   request->send_P(200, "text/html", PAGE_settings_time, boundProcessor); break;
    case SettingsPage::Security:   request->send_P(200, "text/html", PAGE_settings_sec , boundProcessor); break;
    case SettingsPage::DMX:   request->send_P(200, "text/html", PAGE_settings_dmx , boundProcessor); break;
    case SettingsPage::UserMods:   request->send_P(200, "text/html", PAGE_settings_um  , boundProcessor); break;
    case SettingsPage::Welcome: request->send_P(200, "text/html", PAGE_welcome); break;
    default:  request->send_P(200, "text/html", PAGE_settings     , boundProcessor); 
  }
}
