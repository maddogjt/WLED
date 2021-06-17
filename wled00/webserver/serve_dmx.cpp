#include "serve_dmx.h"
#include "wled.h"

String dmxProcessor(const String &var)
{
    String mapJS;
#ifdef WLED_ENABLE_DMX
    if (var == "DMXVARS")
    {
        mapJS += "\nCN=" + String(DMXChannels) + ";\n";
        mapJS += "CS=" + String(DMXStart) + ";\n";
        mapJS += "CG=" + String(DMXGap) + ";\n";
        mapJS += "LC=" + String(ledCount) + ";\n";
        mapJS += "var CH=[";
        for (int i = 0; i < 15; i++)
        {
            mapJS += String(DMXFixtureMap[i]) + ",";
        }
        mapJS += "0];";
    }
#endif

    return mapJS;
}
