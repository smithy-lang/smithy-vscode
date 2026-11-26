$version: "2.0"

namespace example.cities

use aws.api#dataPlane

/// Provides city information.
service Cities {
    version: "2006-03-01"
    operations: [GetCity]
}

@readonly
@dataPlane
operation GetCity {
    input := {
        @required
        cityId: CityId
    }
    output := {
        @required
        name: String
    }
}

/// Identifies a city.
string CityId
