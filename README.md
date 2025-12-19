# react-native-maps-indoors-mapbox

## Documentation

Visit [our reference document site](https://app.mapsindoors.com/mapsindoors/reference/react-native/mapbox/2.6.0/index.html) to get an overview of what the MapsIndoors SDK offers.

## Getting started

`$ npm install @mapsindoors/react-native-maps-indoors-mapbox`

### iOS

The MapsIndoors SDK requires iOS 15.6, so make sure that your podfile is configured for iOS 15.6.
Disable flipper and add !use_frameworks as well as adding config.build_settings to post install script.

```pod
platform :ios, '15.6

flipper_config = FlipperConfiguration.disabled

target 'MyApp' do
  use_frameworks!

  post_install do |installer|
  ...
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.6'
    end
   end
end
...
```

#### Providing API key

1. Navigate to your application settings and add your Mapbox public access token to info with the key `MBXAccessToken`
2. Setup your secret access token for downloading the sdk. Read how to do this here: [Configure credentials](https://docs.mapbox.com/ios/maps/guides/install/#configure-credentials)

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

1. Navigate to the app `gradle.properties` and add the value MAPBOX_DOWNLOADS_TOKEN with your Mapbox download access token.
2. Navigate to the app's project level `build.gradle`.
3. add `maven { url 'https://maven.mapsindoors.com/' }` to `allprojects`/`repositories` as well as the Mapbox maven
​

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://maven.mapsindoors.com/' }
        maven {
            url 'https://api.mapbox.com/downloads/v2/releases/maven'
            authentication {
                basic(BasicAuthentication)
            }
            credentials {
                // Do not change the username below.
                // This should always be `mapbox` (not your username).
                username = "mapbox"
                // Use the secret token you stored in gradle.properties as the password
                password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: ""
            }
        }
    }
}
```

### Expo

This library implements native modules and can't be used with ExpoGO, developments build is required [Delopment Builds](https://docs.expo.dev/develop/development-builds/introduction/)

To build and run correctly, the native ios linkage required to being set as dynamic.
Project configuration can be done with the expo module expo-build-properties.

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
            "deploymentTarget": "15.1"
          }
        }
      ],
      [
        "@mapsindoors/react-native-maps-indoors-mapbox/app.plugin.js", // plugin ref
        {
          "publicToken": "PUBLIC_TOKEN", // your map public token
          "downloadToken": "DOWNLOAD_TOKEN", // your download token
          "staticPods": true // OPTIONAL, add if your project use static linkage for pods (ex: "useFrameworks": "static" with expo-build-properties)
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
