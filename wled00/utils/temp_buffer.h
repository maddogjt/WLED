#pragma once
#include <Arduino.h>

class TempBuffer{
public:
    TempBuffer(char *buffer, size_t bufferSize):
        buffer_(buffer), bufferSize_(bufferSize)
    {
        current_ = 0;
    }

    bool appendi(int i)
    {
        return TempBuffer::printf("%d", i) > 0;
    }

    bool append(const char *txt)
    {
        uint16_t len = strlen(txt);
        if (current_ + len >= bufferSize_)
            return false; // buffer full
        strcpy(buffer_ + current_, txt);
        current_ += len;
        return true;
    }

    int printf(const char *format, ...)
    {
        // use x, y and b

        va_list argptr;
        va_start(argptr, format);

        int written = vsnprintf(buffer_ + current_, bufferSize_ - current_, format, argptr);

        va_end(argptr);

        if (written >= 0) {
            current_ = min(current_ + written, bufferSize_);
        }
        return written;
    }

    size_t length() const {
        return current_;
    }

    const char *buffer() const {
        return buffer_;
    }

private:
    char *buffer_;
    size_t bufferSize_;
    size_t current_;
};