$version: "2.0"

namespace example.weather

/// Provides weather forecasts.
service Weather {
    version: "2006-03-01"
    operations: [GetCurrentTime]
}

@readonly
operation GetCurrentTime {
    input := {}
    output := {
        @required
        time: Timestamp
    }
}
