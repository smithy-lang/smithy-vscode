$version: "1.0"

namespace example.weather

/// Provides weather forecasts.
service Weather {
    version: "2006-03-01",
    operations: [GetCurrentTime]
}

@readonly
operation GetCurrentTime {
    input: GetCurrentTimeInput,
    output: GetCurrentTimeOutput
}

@input
structure GetCurrentTimeInput {}

@output
structure GetCurrentTimeOutput {
    @required
    time: Timestamp
}
