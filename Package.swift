// swift-tools-version: 6.0
import Foundation
import PackageDescription

// Swift Package Manager support for React Native's SwiftPM autolinking (react-native >= 0.88,
// `npx react-native spm`). CocoaPods apps use the podspec instead; the two ship side by side and
// must name the same iOS SDK version (checked by __tests__/nativeSdkVersions.test.ts).
let iosSdkVersion = "4.24.1"

let packageDirectory = URL(fileURLWithPath: #filePath).deletingLastPathComponent()

// SwiftPM cannot mix Swift and Objective-C in one target, so the RCT_EXTERN_MODULE declaration
// files (which never import Swift) are a target of their own. They are found by extension, so a new
// bridge file needs no change here.
let bridgeFiles: [String] = {
    let ios = packageDirectory.appendingPathComponent("ios").path
    guard let walker = FileManager.default.enumerator(atPath: ios) else { return [] }
    var found: [String] = []
    for case let path as String in walker {
        let name = (path as NSString).lastPathComponent
        if name == ".build" || name == "Tests" { walker.skipDescendants(); continue }
        if name.hasSuffix(".m") { found.append(path) }
    }
    return found.sorted()
}()

// The Swift sources rely on the CocoaPods bridging header for React's Objective-C types
// (RCTPromiseResolveBlock and friends). unsafeFlags is allowed here because autolinking consumes
// this package by local path.
let bridgingHeader = packageDirectory.appendingPathComponent("ios/react-native-maps-indoors-Bridging-Header.h").path

// Paths in the repo that are not in the published package (the npm `files` list drops them).
let swiftExcludes = [
    "react-native-maps-indoors-Bridging-Header.h",
    "MapsIndoors.xcodeproj",
    "MapsIndoors.xcworkspace",
    "spm-bridges",
    "core/Package.swift",
    "core/README.md",
    "core/Tests",
    "core/.build",
].filter { FileManager.default.fileExists(atPath: packageDirectory.appendingPathComponent("ios/\($0)").path) }

let reactHeaders: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
]

let package = Package(
    name: "ReactNativeMapsIndoorsMapbox",
    platforms: [.iOS(.v16)],
    products: [
        .library(
            name: "ReactNativeMapsIndoorsMapbox",
            targets: ["ReactNativeMapsIndoorsMapbox", "ReactNativeMapsIndoorsMapboxBridges"]
        ),
    ],
    dependencies: [
        // Resolved by the autolinker relative to build/generated/autolinking/libs/<name> in the app.
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(url: "https://github.com/MapsPeople/mapsindoors-mapbox-ios.git", exact: Version(stringLiteral: iosSdkVersion)),
        .package(url: "https://github.com/MapsPeople/mapsindoors-codable-ios.git", exact: Version(stringLiteral: iosSdkVersion)),
    ],
    targets: [
        .target(
            name: "ReactNativeMapsIndoorsMapboxBridges",
            dependencies: reactHeaders,
            path: "ios",
            sources: bridgeFiles,
            publicHeadersPath: "spm-bridges/include"
        ),
        .target(
            name: "ReactNativeMapsIndoorsMapbox",
            dependencies: reactHeaders + [
                .product(name: "MapsIndoorsMapbox", package: "mapsindoors-mapbox-ios"),
                .product(name: "MapsIndoorsCodable", package: "mapsindoors-codable-ios"),
            ],
            path: "ios",
            exclude: bridgeFiles + swiftExcludes,
            swiftSettings: [
                .unsafeFlags(["-import-objc-header", bridgingHeader]),
            ]
        ),
    ],
    swiftLanguageModes: [.v5]
)
