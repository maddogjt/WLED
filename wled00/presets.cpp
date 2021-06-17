#include "wled.h"

/*
 * Methods to handle saving and loading presets to/from the filesystem
 */

bool applyPreset(byte index, byte callMode)
{
  if (index == 0) return false;
  if (fileDoc) {
    errorFlag = readObjectFromFileUsingId("/presets.json", index, fileDoc) ? Err::NONE : Err::FS_PLOAD;
    JsonObject fdo = fileDoc->as<JsonObject>();
    if (fdo["ps"] == index) fdo.remove("ps"); //remove load request for same presets to prevent recursive crash
    #ifdef WLED_DEBUG_FS
      serializeJson(*fileDoc, Serial);
    #endif
    deserializeState(fdo, callMode, index);
  } else {
    DEBUGFS_PRINTLN(F("Make read buf"));
    DynamicJsonDocument fDoc(JSON_BUFFER_SIZE);
    errorFlag = readObjectFromFileUsingId("/presets.json", index, &fDoc) ? Err::NONE : Err::FS_PLOAD;
    JsonObject fdo = fDoc.as<JsonObject>();
    if (fdo["ps"] == index) fdo.remove("ps");
    #ifdef WLED_DEBUG_FS
      serializeJson(fDoc, Serial);
    #endif
    deserializeState(fdo, callMode, index);
  }

  if (errorFlag == Err::NONE) {
    currentPreset = index;
    return true;
  }
  return false;
}

//persist=false is not currently honored
void savePreset(byte index, bool persist, const char* pname, JsonObject saveobj)
{
  if (index == 0 || index > 250) return;
  bool docAlloc = (fileDoc != nullptr);
  JsonObject sObj = saveobj;

  if (!docAlloc) {
    DEBUGFS_PRINTLN(F("Allocating saving buffer"));
    DynamicJsonDocument lDoc(JSON_BUFFER_SIZE);
    sObj = lDoc.to<JsonObject>();
    if (pname) sObj["n"] = pname;
    DEBUGFS_PRINTLN(F("Save current state"));
    serializeState(sObj, true);
    currentPreset = index;

    writeObjectToFileUsingId("/presets.json", index, &lDoc);
  } else { //from JSON API
    DEBUGFS_PRINTLN(F("Reuse recv buffer"));
    sObj.remove(F("psave"));
    sObj.remove(F("v"));

    if (!sObj["o"]) {
      DEBUGFS_PRINTLN(F("Save current state"));
      serializeState(sObj, true, sObj["ib"], sObj["sb"]);
      currentPreset = index;
    }
    sObj.remove("o");
    sObj.remove("ib");
    sObj.remove("sb");
    sObj.remove(F("error"));
    sObj.remove(F("time"));

    writeObjectToFileUsingId("/presets.json", index, fileDoc);
  }
  presetsModifiedTime = toki.second(); //unix time
  updateFSInfo();
}

void deletePreset(byte index) {
  StaticJsonDocument<24> empty;
  writeObjectToFileUsingId("/presets.json", index, &empty);
  presetsModifiedTime = toki.second(); //unix time
  updateFSInfo();
}