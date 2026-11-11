# react-native-maps-indoors-mapbox.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-maps-indoors-mapbox"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-maps-indoors
                   DESC
  s.homepage     = "https://github.com/github_account/react-native-maps-indoors-mapbox"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { 'MapsPeople' => 'info@mapspeople.com' }
  s.platforms    = { :ios => "16.0" }
  s.source       = { :git => "https://github.com/github_account/react-native-maps-indoors-mapbox.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,cc,cpp,m,mm,swift}"
  # ios/core carries a SwiftPM manifest and unit tests for its React-free helpers (SPEX-2686). They
  # are run with `swift test` in that repository and must not be compiled into the pod, nor must the
  # build products `swift test` leaves in .build (they include a generated `@main` test runner).
  s.exclude_files = "ios/core/Package.swift", "ios/core/Tests/**/*", "ios/core/.build/**/*", "ios/spm-bridges/**/*"
  s.requires_arc = true

  install_modules_dependencies(s)

  # CocoaPods apps get the MapsIndoors SDK as pods, which embed into the app. Do not switch to
  # `spm_dependency`: it attaches the packages to the Pods project's own target, nothing embeds the
  # frameworks, and the app dies at launch with `Library not loaded: @rpath/MapsIndoorsCore...`
  # (SPEX-2429). Apps on React Native's SwiftPM mode (0.88+) use Package.swift instead, which must
  # name the same SDK version.
  s.dependency "MapsIndoorsMapbox11", "4.24.1"
  s.dependency "MapsIndoorsCodable", "4.24.1"
end
