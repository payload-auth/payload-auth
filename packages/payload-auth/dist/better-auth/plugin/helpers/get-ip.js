export function getIp(headers, options) {
    if (options.advanced?.ipAddress?.disableIpTracking) {
        return null;
    }
    const testIP = '127.0.0.1';
    if ((process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') ?? false) {
        return testIP;
    }
    const ipHeaders = options.advanced?.ipAddress?.ipAddressHeaders;
    const keys = ipHeaders || [
        'x-client-ip',
        'x-forwarded-for',
        'cf-connecting-ip',
        'fastly-client-ip',
        'x-real-ip',
        'x-cluster-client-ip',
        'x-forwarded',
        'forwarded-for',
        'forwarded'
    ];
    for (const key of keys){
        const value = headers.get(key);
        if (typeof value === 'string') {
            const ip = value.split(',')[0]?.trim();
            if (ip) return ip;
        }
    }
    return null;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9nZXQtaXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoT3B0aW9ucyB9IGZyb20gJ2JldHRlci1hdXRoJ1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SXAoaGVhZGVyczogSGVhZGVycywgb3B0aW9uczogQmV0dGVyQXV0aE9wdGlvbnMpOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKG9wdGlvbnMuYWR2YW5jZWQ/LmlwQWRkcmVzcz8uZGlzYWJsZUlwVHJhY2tpbmcpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGNvbnN0IHRlc3RJUCA9ICcxMjcuMC4wLjEnXG4gIGlmICgocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0JyB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JykgPz8gZmFsc2UpIHtcbiAgICByZXR1cm4gdGVzdElQXG4gIH1cbiAgY29uc3QgaXBIZWFkZXJzID0gb3B0aW9ucy5hZHZhbmNlZD8uaXBBZGRyZXNzPy5pcEFkZHJlc3NIZWFkZXJzXG4gIGNvbnN0IGtleXMgPSBpcEhlYWRlcnMgfHwgW1xuICAgICd4LWNsaWVudC1pcCcsXG4gICAgJ3gtZm9yd2FyZGVkLWZvcicsXG4gICAgJ2NmLWNvbm5lY3RpbmctaXAnLFxuICAgICdmYXN0bHktY2xpZW50LWlwJyxcbiAgICAneC1yZWFsLWlwJyxcbiAgICAneC1jbHVzdGVyLWNsaWVudC1pcCcsXG4gICAgJ3gtZm9yd2FyZGVkJyxcbiAgICAnZm9yd2FyZGVkLWZvcicsXG4gICAgJ2ZvcndhcmRlZCdcbiAgXVxuICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgY29uc3QgdmFsdWUgPSBoZWFkZXJzLmdldChrZXkpXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGlwID0gdmFsdWUuc3BsaXQoJywnKVswXT8udHJpbSgpXG4gICAgICBpZiAoaXApIHJldHVybiBpcFxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuIl0sIm5hbWVzIjpbImdldElwIiwiaGVhZGVycyIsIm9wdGlvbnMiLCJhZHZhbmNlZCIsImlwQWRkcmVzcyIsImRpc2FibGVJcFRyYWNraW5nIiwidGVzdElQIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwiaXBIZWFkZXJzIiwiaXBBZGRyZXNzSGVhZGVycyIsImtleXMiLCJrZXkiLCJ2YWx1ZSIsImdldCIsImlwIiwic3BsaXQiLCJ0cmltIl0sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLFNBQVNBLE1BQU1DLE9BQWdCLEVBQUVDLE9BQTBCO0lBQ2hFLElBQUlBLFFBQVFDLFFBQVEsRUFBRUMsV0FBV0MsbUJBQW1CO1FBQ2xELE9BQU87SUFDVDtJQUNBLE1BQU1DLFNBQVM7SUFDZixJQUFJLEFBQUNDLENBQUFBLFFBQVFDLEdBQUcsQ0FBQ0MsUUFBUSxLQUFLLFVBQVVGLFFBQVFDLEdBQUcsQ0FBQ0MsUUFBUSxLQUFLLGFBQVksS0FBTSxPQUFPO1FBQ3hGLE9BQU9IO0lBQ1Q7SUFDQSxNQUFNSSxZQUFZUixRQUFRQyxRQUFRLEVBQUVDLFdBQVdPO0lBQy9DLE1BQU1DLE9BQU9GLGFBQWE7UUFDeEI7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO0tBQ0Q7SUFDRCxLQUFLLE1BQU1HLE9BQU9ELEtBQU07UUFDdEIsTUFBTUUsUUFBUWIsUUFBUWMsR0FBRyxDQUFDRjtRQUMxQixJQUFJLE9BQU9DLFVBQVUsVUFBVTtZQUM3QixNQUFNRSxLQUFLRixNQUFNRyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRUM7WUFDaEMsSUFBSUYsSUFBSSxPQUFPQTtRQUNqQjtJQUNGO0lBQ0EsT0FBTztBQUNUIn0=