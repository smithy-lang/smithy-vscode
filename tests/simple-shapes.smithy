// SYNTAX TEST "source.smithy" "This tests simple shapes"
$version: "2.0"

namespace com.example

blob Blob
// <----  keyword.statement.smithy
//   ^^^^ entity.name.type.smithy

boolean Bool
// <-------  keyword.statement.smithy
//      ^^^^ entity.name.type.smithy

string String
// <------    keyword.statement.smithy
//     ^^^^^^ entity.name.type.smithy

byte Byte
// <----  keyword.statement.smithy
//   ^^^^ entity.name.type.smithy

short Short
// <-----   keyword.statement.smithy
//    ^^^^^ entity.name.type.smithy

integer Integer
// <-------     keyword.statement.smithy
//      ^^^^^^^ entity.name.type.smithy

long Long
// <----  keyword.statement.smithy
//   ^^^^ entity.name.type.smithy

float Float
// <-----   keyword.statement.smithy
//    ^^^^^ entity.name.type.smithy

double Double
// <------    keyword.statement.smithy
//     ^^^^^^ entity.name.type.smithy

bigInteger BigInt
// <----------    keyword.statement.smithy
//         ^^^^^^ entity.name.type.smithy

bigDecimal BigDecimal
// <----------        keyword.statement.smithy
//         ^^^^^^^^^^ entity.name.type.smithy

timestamp Timestamp
// <---------       keyword.statement.smithy
//        ^^^^^^^^^ entity.name.type.smithy

document Document
// <--------      keyword.statement.smithy
//       ^^^^^^^^ entity.name.type.smithy