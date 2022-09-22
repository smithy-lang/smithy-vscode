$version: "2.0"

namespace example.weather

use aws.api#dataPlane
use aws.api#service

/// Provides weather forecasts.
@service(
  sdkId: "Weather",
)
service Weather {
    version: "2006-03-01"
    operations: [GetCurrentTime]
}

@readonly
@dataPlane
operation GetCurrentTime {
    input := {}
    output := {
        @required
        time: Timestamp
    }
}
