# react-native-maps-indoors-mapbox

## Documentation

Visit [our reference document site](https://app.mapsindoors.com/mapsindoors/reference/react-native/mapbox/2.11.0/index.html) to get an overview of what the MapsIndoors SDK offers.

## Changelog

### [2.11.0] - 2026-11-10

#### Added

- `MPDisplayRule.getIconZoomFactor` and `setIconZoomFactor`: how much a location's icon grows across
  the solution's icon zoom range. The factor must be finite and within `0 < factor <= 4`; any other
  value is ignored with a console warning. The default is `1`. Mapbox only: icons do not scale with
  Google Maps
- `MPSolutionConfig.iconScaleZoomFrom` and `iconScaleZoomTo`: the solution's icon zoom range, as the
  solution stores it, or `undefined` when it is not set
- Swift Package Manager support for apps built with React Native 0.88's `npx react-native spm`
  (experimental). The package ships a `Package.swift` next to the podspec; CocoaPods stays supported

#### Changed

- Updated the MapsIndoors iOS SDK to 4.24.1, the release that carries base-map caching before the
  first map
- Updated the MapsIndoors Android SDK to 4.24.2

#### Fixed

- On iOS, `MapsIndoors.synchronizeBaseMapTiles` no longer rejects with error 9000 before
  `MapControl.create` has run, so base-map tiles can be cached ahead of the first map, as on
  Android. `MapsIndoors.isBaseMapCachingSupported` and `synchronizeBaseMapTiles` now agree on
  Mapbox. Until `MapControl.create` has run, the MapsIndoors Mapbox style is cached
- `MapControl.selectBuilding` and `MapControl.goTo` now pass a building's floors to the native SDK,
  which used to receive the building without any

### [2.10.0] - 2026-11-02

#### Added

- MapsIndoors Insights now attributes sessions from this package to its own component -
  `React Native/android SDK` or `React Native/iOS SDK`, with the package's published version -
  instead of reporting them as the plain native SDK. The version travels on `MapsIndoors.load`,
  which is when the native SDK starts the session and snapshots the component, so the first session
  after a cold start is attributed too

#### Changed

- No Mapbox download token is needed any more (Mapbox SDK 11.8+ downloads are public). The Expo
  plugin ignores `downloadToken`, warns when it is set, and no longer writes
  `MAPBOX_DOWNLOADS_TOKEN` to `gradle.properties` or credentials to `~/.netrc`. The Mapbox Maven
  repository is added without credentials
- `MapControl.getCurrentFloorIndex`, `getCurrentMapsIndoorsZoom`, `isFloorSelectorHidden` and
  `isUserPositionShown` reject when there is no map control. iOS resolved `null`, which reads as a
  real floor index, zoom or `false`; Android crashed

#### Fixed

- On iOS, the blue dot now shows for a JavaScript position provider whose results leave out
  `floorIndex`. Every such update was rejected, silently
- On iOS, the blue dot now shows for a position provider set after calling `MapsIndoors.load` again
  while the map stays mounted
- Expo builds without `downloadToken` no longer fail to download Mapbox. The plugin wrote
  `undefined` as the token to `gradle.properties` and `~/.netrc`, which Mapbox rejects with 401.
  If an earlier plugin version wrote one, remove the `machine api.mapbox.com` entry from `~/.netrc`
- Opening and closing a map no longer leaks memory on every visit. On iOS, setting a position
  provider kept the map alive in a retain cycle. On Android, the map's `MapControl` was never
  destroyed and a layout callback kept running for good, so each map stayed in memory; the
  `MapControl` is now destroyed with its map view. Without one, Android `MapControl` calls now
  reject, resolve `null` or do nothing, as on iOS, instead of crashing
- On Android, `MapControl.clearFilter`, `clearHighlight` and `showUserPosition` resolve when there is
  no map control, instead of never settling
- MapsIndoors Insights `directions_started` and `directions_completed` events now carry the
  route's origin and destination location and venue, as from native apps. Requires a route
  `MPDirectionsService.getRoute` returned since the last `MapsIndoors.load`, among the ten most
  recently used; a copy made through JSON qualifies, an edited route does not

### [2.9.1] - 2026-10-16

#### Changed

- `MPRouteStopIconConfig.getImage()` returns a string instead of a `URL`, and a custom
  `RouteStopIconConfig.getImage()` may return either
- Updated the MapsIndoors Android and iOS SDKs to 4.23.0
- On iOS, camera moves the SDK makes for you (`goTo`, selecting with `moveCamera`, filter, highlight
  and route fits) are instant when the system's Reduce Motion setting is on
- On Android, with a custom floor selector that turns automatic floor changes off, `goTo`,
  `selectLocation`, `setFilter` and `setHighlight` keep the current floor
- On iOS, `MapControl` and `MPDirectionsRenderer` promises settle once the map has applied the call,
  not before
- On iOS, the `MapControl.getCurrent*` getters and `isFloorSelectorHidden` resolve `null` when there
  is no map control, instead of crashing
- On iOS, `MPDirectionsRenderer.setRoute` and `setDefaultRouteStopIcon` reject when a URL icon fails
  to download, instead of never settling

#### Fixed

- `MPDirectionsRenderer.setDefaultRouteStopIcon` and `setRoute` rejected an `MPRouteStopIconConfig`
  stop icon with "Invalid URL" on React Native versions with a standards-compliant `URL`, such as
  Expo 55, so the icon never reached the map. Labels containing `?` or `#` now work too
- Setting `MapControl.showUserPosition` no longer crashes the app on iOS. The iOS SDK now accepts
  the call from React Native's module thread, where 4.20.0 required the main thread
- `MapControl` and `MPDirectionsRenderer` calls no longer crash the app on iOS. They now reach the map
  on the main thread, in the order they were made
- `MPDirectionsRenderer.setRoute` and `setDefaultRouteStopIcon` with URL icons no longer overwrite a
  later `setRoute`, `clear` or `setDefaultRouteStopIcon` when their download finishes last
- The published package no longer contains the core unit tests (`src/core/__tests__`)
- `MPCameraPosition.create` no longer swaps tilt and bearing, so reading the camera with
  `getCurrentCameraPosition` and passing the result back to `animateCamera` keeps the map's pitch
  and rotation

### [2.9.0] - 2026-09-18

#### Added

##### Offline base map tiles support [Mapbox]

- Offline Mapbox base-map tiles. `MapsIndoors.setBaseMapTilesEnabled(enabled, apiKey)` marks a
  solution for base-map caching, and `MapsIndoors.synchronizeBaseMapTiles(onProgress?, apiKeys?)`
  downloads the tiles - the outdoor map underneath MapsIndoors, which `cacheData` does not cover.
  Both are needed for a map that renders with no network connection. Progress is reported through
  the optional `onProgress` listener, since the download can take minutes.
  `MapsIndoors.isBaseMapCachingSupported()` reports whether the map provider can cache at all

##### Improved DirectionsRenderer

- `MPDirectionsRenderer.setOptions(options)` and `getOptions()`, which style a rendered route from a
  single `MPDirectionsRendererOptions` object - line color, opacity, weight and `MPStrokeStyle`, the
  background halo, the animated overlay and its `MPRouteAnimationType`, a repeating
  `MPRouteStampType` stamp with its `MPRouteArrowStyle`, `MPRouteMarkerDisplayRule` styling for the
  route's start and end markers, per connector `MPLegBoundaryIcons`, 3D elevation (Mapbox only) and
  the camera's fit-bounds max zoom. Each option resolves on its own - the value set here, then the
  solution level default from the CMS, then the SDK's built-in default - so options left out are
  inherited rather than reset. This supersedes `setPolylineColors` and `setAnimatedPolyline`, which
  are now deprecated
- `MPDirectionsRenderer.finishGuidance(usagePercentage?)`, which signals that guidance on the
  current route has finished, optionally supplying how much of the route was travelled

##### Enhanced Language support

- `resolveLanguageTag(tag, availableLanguages)` and `normalizeLanguageTag(tag)`, for turning a
  device locale into the exact language tag a solution publishes before calling
  `MapsIndoors.setLanguage`. `resolveLanguageTag('zh-Hant-TW', solution.availableLanguages)`
  returns `'zh-Hant'`
- `MPSolution.resolveLanguage(language)`, the same lookup against that solution's own languages
#### Changed

- Updated the MapsIndoors Android SDK to 4.22.0 and the iOS SDK to 4.20.0, the releases that carry
  the base-map tile cache
- `MPSolution.hasLanguage` now matches language tags the way the native SDKs do, instead of
  requiring an exact string. Casing is ignored, the ICU underscore form is accepted (`zh_Hans`),
  legacy region-only Chinese tags resolve to their script (`zh-CN` matches `zh-Hans`, `zh-TW`
  matches `zh-Hant`), and a more specific tag falls back to a less specific one (`en-US` matches
  `en`). It stays deliberately strict about ambiguity: bare `zh` does not match a solution that
  publishes only `zh-Hans` and `zh-Hant`, because there is no way to tell which script is wanted
- `MapsIndoors.setLanguage` documents what its returned boolean means on each platform. On Android
  it is `false` for a language the solution does not have, and also while the SDK is still loading
  or synchronizing - in which case the change is queued rather than lost. On iOS it reports only
  that the tag was accepted, with no check against the solution. Read the language back with
  `getLanguage` to confirm a change took effect
- `MapsIndoors.setLanguage` resolves `false` for an empty language tag without calling into the
  native SDK, matching Android's own precondition. iOS would otherwise accept it and store an
  empty language

#### Fixed

- The iOS geometry helpers never decoded the polygon they were given, because
  `JSONDecoder` is not polymorphic and the SDK's internal `mp_polygon` accessors are nil on a
  freshly decoded value. `MPPolygon.contains` therefore always answered `false`, `getArea` always
  `0`, and `distanceToClosestEdge` resolved `undefined` despite being typed `Promise<number>`. The
  concrete geometry type is now decoded from the GeoJSON `type` discriminator, as on Android, so
  multi-polygon geometry works by construction
- Serialising SDK models to the bridge on Android walked native memory by reflection. `MPLocation`
  holds an `MPIcon` whose layer holds an `android.graphics.Bitmap`, and the buffer behind a Bitmap
  carries a `Cleaner` that is linked to every other live Cleaner in the process - so the work grew
  with whatever the host app had allocated, not with the map data. This only showed up on physical
  devices with a real app around them
- `MapsIndoors.setLanguage` always resolved `null` on iOS, despite being typed `Promise<boolean>`.
  It now resolves the native SDK's real result, as it already did on Android
- `MapsIndoors.getAvailableLanguages` and `getDefaultLanguage` rejected with an unparseable error
  on iOS when called before the solution had loaded, so the `MPError` never reached the caller.
  Both now reject with an `MPError`, as they already did on Android
- `MapsIndoors.getDefaultLanguage` resolved `null` on Android when no solution was loaded, despite
  being typed `Promise<string>`. It now rejects with an `MPError`, matching iOS
- `MapsIndoors.getSolution` resolved `null` on Android whenever no solution was loaded - including
  the moment right after a language change, which reloads the solution. Callers either crashed in
  `JSON.parse` or got a solution whose `availableLanguages` was `undefined`, so `hasLanguage`
  answered `false` for every tag. It now rejects with an `MPError`, matching iOS
- `MapsIndoors.getLocations` discarded a native rejection instead of propagating it, then failed
  in `JSON.parse` with "Unexpected character: u". The real error now reaches the caller
- `MPError.parse` threw a `SyntaxError` when a rejection did not carry the native SDK's JSON
  payload - a bridge-level or JavaScript error - replacing the real message with "JSON Parse
  error: Unexpected character". It now wraps such a message as an unknown error and keeps the text

### [2.8.0] - 2026-08-17

#### Changed

- **Breaking:** raised the minimum iOS deployment target to 16.0 (from 15.6), as required by the
  MapsIndoors iOS SDK. Update your Podfile, and `expo-build-properties`' `deploymentTarget` if you
  use Expo - see [iOS](#ios)
- **Breaking:** raised the minimum supported React Native version to 0.75.0
- Updated MapsIndoors Android SDK to 4.18.6
- Updated MapsIndoors iOS SDK to 4.19.1

#### Fixed

- The map turning black after navigating away from and back to the map screen when using
  `react-native-screens`' native stack
- The map continuing to render in the background while the app was backgrounded, which wasted
  battery

### 2.7.0

- Updated MapsIndoors Android SDK to 4.18.3
- Updated MapsIndoors iOS SDK to 4.17.2
- Added React Native New Architecture support (TurboModules / Fabric interop layer)
- Added `setPolylineColors` to `MPDirectionsRenderer` to allow customizing the foreground and background color of the displayed route

## Getting started

`$ npm install @mapsindoors/react-native-maps-indoors-mapbox`

### iOS

The MapsIndoors SDK requires iOS 16.0, so make sure that your podfile is configured for iOS 16.0.
Disable flipper and add `use_frameworks!` as well as adding config.build_settings to post install
script.

```pod
platform :ios, '16.0'

flipper_config = FlipperConfiguration.disabled

target 'MyApp' do
  use_frameworks!

  post_install do |installer|
  ...
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
    end
   end
end
...
```

#### Swift Package Manager (experimental)

React Native 0.88 can build an iOS app without CocoaPods: run `npx react-native spm` in the app's
`ios` folder. This package ships a `Package.swift` for that mode; CocoaPods stays supported. It needs
iOS 16 and no extra setup. Verified on a bare React Native 0.88 app, not on Expo or with
`app.plugin.js`.

#### Providing API key

Navigate to your application settings and add your Mapbox public access token to info with the key `MBXAccessToken`

### Android

#### Android Mapbox Setup

​
To get the underlying Mapbox to function, you need to perform the following steps:
​

1. Navigate to `android/app/src/main/res/value`.
2. Create a file in this folder called `mapbox_access_token.xml`.
3. Copy and paste the below code snippet and replace `YOUR_KEY_HERE` with your Mapbox api key.
​

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="mapbox_access_token" translatable="false">YOUR_KEY_HERE</string>
    <string name="mapbox_api_key" translatable="false">YOUR_KEY_HERE</string>
</resources>
```

#### MapsIndoors Gradle Setup

​
The plugin Gradle project has trouble resolving the MapsIndoors dependency, so to ensure that it is resolved correctly, do the following:

1. Navigate to the app's project level `build.gradle`.
2. add `maven { url 'https://maven.mapsindoors.com/' }` to `allprojects`/`repositories` as well as the Mapbox maven
​

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://maven.mapsindoors.com/' }
        maven { url 'https://api.mapbox.com/downloads/v2/releases/maven' }
    }
}
```

### Expo

This library implements native modules and can't be used with ExpoGO, developments build is required [Delopment Builds](https://docs.expo.dev/develop/development-builds/introduction/)

To build and run correctly, the native ios linkage is required to be set as dynamic
(`useFrameworks: "dynamic"`). Project configuration can be done with the expo module
expo-build-properties.

with npx :  
`$ npx expo install expo-build-properties`

with npm :  
`$ npm install expo-build-properties`

with yarn :  
`$ yarn add expo-build-properties`

This library includes an expo plugin to support native integration.
To enable it, you need to add the configuration in your expo configuration.

```json
// app.json

{
  "expo": {
    // ... your configuration
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "16.0",
            "useFrameworks": "dynamic"
          }
        }
      ],
      [
        "@mapsindoors/react-native-maps-indoors-mapbox/app.plugin.js", // plugin ref
        {
          "publicToken": "PUBLIC_TOKEN", // your map public token
          "staticPods": true // OPTIONAL, add if your project uses static linkage for pods (ex: "useFrameworks": "static" with expo-build-properties)
        }
      ]
    ]
  }
}
```

## Usage

### Showing your map

This snippet shows you how to set up MapsIndoors in a React Native application.

```javascript
import MapsIndoors, { MapControl, MapView } from 'react-native-maps-indoors';
...
//Function to initialize mapsindoors and mapcontrol. To load a solution and show data onto the map.
const loadMapsIndoors = () => {
    //Load solution data with your api key
    MapsIndoors.load('API_KEY').then(async () => {
        //Create the MapControl. Which will be using the MapView of the component.
        const mc = await MapControl.create(new MPMapConfig({useDefaultMapsIndoorsStyle: true}), NativeEventEmitter);
        //Get a venue and move the camera to it.
        let venue: MPVenue = (await MapsIndoors.getVenues()).getAll()[0];
        mapControl.goTo(venue);
    }
}

...
render() {
  return (
    <MapView
        style={{
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
        }}
    />
  );
}
...
```

### Showing a route

```javascript
  const showRoute = async () => {
    let point = new MPPoint(57.0580431, 9.9505475);
    let point2 = new MPPoint(57.0581638, 9.9507732, 10);
    var directionsService = await MPDirectionsService.create();

    //Optional query parameters for the route.
    directionsService.setIsDeparture(true);
    directionsService.setTime(Date.now());
    directionsService.setTravelMode('bicycling');

    var route = await directionsService.getRoute(point, point2);
    directionsRenderer = new MPDirectionsRenderer(NativeEventEmitter);
    directionsRenderer.setRoute(route);
  };
```

### Searching locations

This code snippet shows a function called `searchForParking` that takes a single argument of type `MPPoint`. The function uses `MapsIndoors` to search for locations matching the query string `"parking"` near the point specified, and uses the filter to only get the first 10 matches.
​
It mathces in the locations' descriptions, names, and external IDs to the query string. Once the search is complete, it is possible to update/get information from the locations (not specified in the code snippet).

```javascript
const searchForParking = async (point: MPPoint) => {
    let query = MPQuery.create({query: "parking",
                                near: point,
                                queryProperties: [MPLocationPropertyNames.description, MPLocationPropertyNames.name, MPLocationPropertyNames.externalId]});
    let filter = MPFilter.create({take: 10});
    let parkingLotsNearPoint = await MapsIndoors.getLocationsAsync(query, filter);
}
```

### Changing the look with DisplayRules

​
This code snippet shows three ways to manipulate display rules in the MapsIndoors SDK.
​
The `hideLocationsByDefault` method hides all markers that are not explicitly visible by setting the main display rule to not visible.
​
The `showLocationsByDefault` method ensures all markers are shown by setting the main display rule to visible.
​
The `changeTypePolygonColor(String type, String color)` method changes the fill color for all polygons belonging to a specific type. It gets the display rule for the specified type using `getDisplayRuleByName`, and sets the fill color using `setPolygonFillColor`.
​
These methods can all be used to customize the display of markers and polygons on the map.
​

```javascript
// This method changes the main display rule to hide all markers,
// This will cause all locations/types that are not explicitly visible to be hidden.
const hideLocationsByDefault = async () => {
    let mainDisplayRule = await MapsIndoors.getMainDisplayRule();
    mainDisplayRule?.setVisible(false);
}
​
// This method changes the main display rule to show all markers,
// This will cause all locations/types that are not explicitly visible to be shown.
const showLocationsByDefault = async () => {
    let mainDisplayRule = await MapsIndoors.getMainDisplayRule();
    mainDisplayRule?.setVisible(true);
}
​
// This method changes the fill color for all polygons belonging to a specific [type]
// the color MUST be a valid hex color string.
const changeTypePolygonColor = async (type: string, color: string) => {
    let typeDisplayRule = await MapsIndoors.getDisplayRuleByName(type);
    typeDisplayRule?.setPolygonFillColor(color);
}
```

[2.8.0]: https://github.com/MapsPeople/react-native-mapsindoors-mapbox/compare/2.7.0...2.8.0
