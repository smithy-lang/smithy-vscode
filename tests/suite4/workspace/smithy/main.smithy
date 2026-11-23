$version: "2.0"

namespace example.weather

use aws.api#dataPlane
use smithy.waiters#waitable

/// Provides weather forecasts.
service Weather {
    version: "2006-03-01"
    operations: [GetCurrentTime, GetWeatherReport]
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

@waitable(
    ReportGenerated: {
        documentation: "Wait until the weather report is generated"
        acceptors: [
            {
                state: "success"
                matcher: {
                    success: true
                }
            }
            {
                state: "retry"
                matcher: {
                    errorType: "NotFound"
                }
            }
        ]
    }
)
operation GetWeatherReport {
    input := {
        @required
        cityId: String
    }
    output := {
        @required
        temperature: String
    }
    errors: [NotFound]
}

@error("client")
structure NotFound {
    @required
    message: String
}
