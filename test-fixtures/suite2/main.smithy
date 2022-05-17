$version: "1.0"

namespace example.weather

/// Provides weather forecasts.
service Weather {
    version: "2006-03-01",
    operations: [GetCurrentTime]
}
