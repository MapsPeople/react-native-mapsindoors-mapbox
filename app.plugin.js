const {
  withProjectBuildGradle,
  withGradleProperties,
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
const withAPIKeys = (apiKey, token) => (config) => {
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
      <string name="mapbox_api_key" translatable="false">${apiKey}</string>
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
 * Plugin to add mapbox private token to gradle properties
 * @param {*} config expo project config
 * @param {*} token private token to set
 * @returns modified config
 */
const withGradleProps = (token) => (config) => {
  return withGradleProperties(config, (modConf) => {
    modConf.modResults.push({
      type: "property",
      key: "MAPBOX_DOWNLOADS_TOKEN",
      value: token,
    });

    return modConf;
  });
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
         maven {
             url 'https://api.mapbox.com/downloads/v2/releases/maven'
             authentication {
                 basic(BasicAuthentication)
             }
             credentials {
                 // Do not change the username below.
                 // This should always be 'mapbox' (not your username).
                 username = "mapbox"
                 // Use the secret token you stored in gradle.properties as the password
                 password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: ""
             }
         }`
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
 * Plugin to add mapsindoors user system setup
 * @param {*} token private token to set
 */
const withiOSSecret = (token) => (config) => {
  return withDangerousMod(config, [
    "ios",
    async (modConf) => {
      const home = path.resolve(process.env.HOME);
      const netrc = path.resolve(home, ".netrc");

      // conf to add
      const conf = `machine api.mapbox.com
  login mapbox
  password ${token}
  `;

      const exists = fs.existsSync(netrc);

      if (!exists) {
        // no previous conf, write new one
        fs.writeFileSync(netrc, conf, { flag: "w" });
      } else {
        // get content
        let content = fs.readFileSync(netrc, "utf-8");
        const lines = content.split("\n");

        // check if mapbox conf exist
        const found = lines.findIndex((line) =>
          line.includes("machine api.mapbox.com")
        );

        if (found >= 0) {
          // remove previous mapbox conf
          content = lines
            .filter((_, idx) => ![found, found + 1, found + 2].includes(idx))
            .join("\n");
          fs.writeFileSync(netrc, content, { flag: "w" });
        }

        // write new conf
        fs.writeFileSync(netrc, conf, { flag: "a+" });
      }

      return modConf;
    },
  ]);
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
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
          config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'
      end
    end\n`
      );

      fs.writeFileSync(podfile, contents, "utf8");

      return modConf;
    },
  ]);
};

/**
 * Combine Expo configuration and properties
 * @param {*} config expo project config
 * @param {*} {apiKey} api key to set
 * @param {*} {downloadToken} Mapbox download token
 * @param {*} {publicToken} Mapbox public token
 * @returns modified config
 */
const withMapsPeopleMapbox = (
  config,
  { apiKey, downloadToken, publicToken }
) => {
  const plugins = [
    withGradleProps(downloadToken),
    withAPIKeys(apiKey, publicToken),
    withMavenRepo,
    withTokenInfoPlist(publicToken),
    withiOSSecret(downloadToken),
    withPodfile,
  ];

  return withPlugins(config, plugins);
};

module.exports = withMapsPeopleMapbox;