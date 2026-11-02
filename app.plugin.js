const {
    withProjectBuildGradle,
    withPlugins,
    withDangerousMod,
    withInfoPlist,
  } = require("@expo/config-plugins");
  
  const path = require("path");
  const fs = require("fs");
  
  /**
   * Plugin to add mapbox api key and access token to mapbox_access_token.xml
   * @param {*} apiKey api key to set
   * @param {*} token access token to set
   * @param {*} config expo project config
   * @returns modified config
   */
  const withAPIKeys = (token) => (config) => {
    return withDangerousMod(config, [
      "android",
      async (config) => {
        const filePath = path.resolve(
          config.modRequest.projectRoot,
          config.modRequest.platformProjectRoot,
          `app/src/main/res/values`
        );
  
        // new file
        const fileName = "mapbox_access_token.xml";
        const content = `<?xml version="1.0" encoding="utf-8"?>
    <resources>
        <string name="mapbox_access_token" translatable="false">${token}</string>
        <string name="mapbox_api_key" translatable="false">${token}</string>
    </resources>`;
  
        const newFilePath = path.resolve(filePath, fileName);
  
        // create a new file
        if (!fs.existsSync(newFilePath)) {
          fs.writeFileSync(newFilePath, content);
        }
  
        return config;
      },
    ]);
  };
  
  /**
   * Plugin to add mapsindoors maven repository
   * @param {*} config expo project config
   * @returns modified config
   */
  const withMavenRepo = (config) => {
    return withProjectBuildGradle(config, (modConf) => {
      const content = modConf.modResults.contents.replace(
        "maven { url 'https://www.jitpack.io' }",
  
        `maven { url 'https://www.jitpack.io' }
           maven { url 'https://maven.mapsindoors.com/' }
           maven { url 'https://api.mapbox.com/downloads/v2/releases/maven' }`
      );
  
      modConf.modResults.contents = content;
      return modConf;
    });
  };
  
  /**
   * Plugin to add mapsindoors Plist infos
   * @param {*} config expo project config
   * @param {*} token access token to set
   * @returns modified config
   */
  const withTokenInfoPlist = (token) => (config) => {
    return withInfoPlist(config, (modConf) => {
      modConf.modResults["MBXAccessToken"] = token;
      return modConf;
    });
  };
  
  /**
   * Plugin to add podfile script
   * @param {*} config expo project config
   * @returns modified config
   */
  const withPodfile = (config) => {
    return withDangerousMod(config, [
      "ios",
      (modConf) => {
        const podfile = path.join(
          modConf.modRequest.platformProjectRoot,
          "Podfile"
        );
  
        let contents = fs.readFileSync(podfile, "utf-8");
  
        contents = contents.replace(
          `post_install do |installer|`,
          `post_install do |installer|\n
      installer.pods_project.targets.each do |target|
        target.build_configurations.each do |config|
            config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
        end
      end\n`
        );
  
        fs.writeFileSync(podfile, contents, "utf8");
  
        return modConf;
      },
    ]);
  };
  
  /**
   * Plugin to add podfile linkage script script
   * @param {*} staticPods true if project is build as static, false/undefined if build as dynamic
   * @param {*} config expo project config
   * @returns modified config
   */
  const withStaticLinkage = (staticPods) => (config) => {
    if (!staticPods) {
      return config;
    }
  
    return withDangerousMod(config, [
      "ios",
      (modConf) => {
        const podfile = path.join(
          modConf.modRequest.platformProjectRoot,
          "Podfile"
        );
  
        let contents = fs.readFileSync(podfile, "utf-8");
  
        if (!contents.includes("pre_install do |installer|")) {
          // add preinstall script if not present
          contents = contents.replace(
            `post_install do |installer|`,
            `pre_install do |installer|
    end
            
    post_install do |installer|`
          );
        }
  
        // complete script with dynamic linkage for this lib
        contents = contents.replace(
          `pre_install do |installer|`,
          `dynamic_frameworks = ["MapboxMaps", "MapboxCoreMaps", "MapboxCommon", "MapboxMobileEvents", "MapboxDirections", "Polyline", "Turf"]
    
    # override default static linkage
    pre_install do |installer|
      installer.pod_targets.each do |pod|
        if dynamic_frameworks.include?(pod.name)
          puts "Overriding the static_framework? method for #{pod.name}"
          def pod.static_framework?;
            false
          end
          def pod.build_type;
            Pod::BuildType.dynamic_framework
          end
        end
      end`
        );
  
        fs.writeFileSync(podfile, contents, "utf8");
  
        return modConf;
      },
    ]);
  };
  
  /**
   * Combine Expo configuration and properties
   * @param {*} config expo project config
   * @param {*} {downloadToken} deprecated and ignored: Mapbox SDK downloads need no token
   * @param {*} {publicToken} Mapbox public token
   * @returns modified config
   */
  const withMapsPeopleMapbox = (
    config,
    { downloadToken, publicToken, staticPods }
  ) => {
    if (downloadToken !== undefined) {
      console.warn(
        "@mapsindoors/react-native-maps-indoors-mapbox: `downloadToken` is deprecated and ignored. Mapbox SDK downloads need no token; remove it from your plugin config."
      );
    }

    const plugins = [
      withAPIKeys(publicToken),
      withMavenRepo,
      withTokenInfoPlist(publicToken),
      withPodfile,
      withStaticLinkage(staticPods),
    ];
  
    return withPlugins(config, plugins);
  };
  
  module.exports = withMapsPeopleMapbox;