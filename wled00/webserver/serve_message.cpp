#include "serve_message.h"
#include "wled.h"

static String msgProcessor(const String &var)
{
    if (var == "MSG")
    {
        String messageBody = messageHead;
        messageBody += F("</h2>");
        messageBody += messageSub;
        uint32_t optt = optionType;

        if (optt < 60) //redirect to settings after optionType seconds
        {
            messageBody += F("<script>setTimeout(RS,");
            messageBody += String(optt * 1000);
            messageBody += F(")</script>");
        }
        else if (optt < 120) //redirect back after optionType-60 seconds, unused
        {
            //messageBody += "<script>setTimeout(B," + String((optt-60)*1000) + ")</script>";
        }
        else if (optt < 180) //reload parent after optionType-120 seconds
        {
            messageBody += F("<script>setTimeout(RP,");
            messageBody += String((optt - 120) * 1000);
            messageBody += F(")</script>");
        }
        else if (optt == 253)
        {
            messageBody += F("<br><br><form action=/settings><button class=\"bt\" type=submit>Back</button></form>"); //button to settings
        }
        else if (optt == 254)
        {
            messageBody += F("<br><br><button type=\"button\" class=\"bt\" onclick=\"B()\">Back</button>");
        }
        return messageBody;
    }
    return String();
}

void serveMessage(AsyncWebServerRequest *request, uint16_t code, const String &headl, const String &subl, byte optionT)
{
    messageHead = headl;
    messageSub = subl;
    optionType = optionT;

    request->send_P(code, "text/html", PAGE_msg, msgProcessor);
}
