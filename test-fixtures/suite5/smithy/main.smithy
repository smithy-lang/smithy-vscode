$version: "2.0"

namespace example.weather

/// Provides weather forecasts.
service Weather {
    version: "2006-03-01"
    operations: [GetCurrentTime]
}

operation GetCurrentTime {
    // Below line to be indented.
input := {}
}
