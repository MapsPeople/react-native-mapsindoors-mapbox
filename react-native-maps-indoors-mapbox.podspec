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
  s.requires_arc = true

  install_modules_dependencies(s)

  # MapsIndoors' iOS SDK is consumed via CocoaPods, which resolves MapsIndoorsCore and MapboxMaps
  # 11.x transitively and embeds them into the consuming app.
  #
  # This deliberately does *not* use the Swift Package Manager integration introduced in SPEX-889:
  # `spm_dependency` attaches the packages to the Pods project's own target, and nothing then
  # embeds the resulting dynamic frameworks into the app bundle, so the app builds and links but
  # dies at launch with `Library not loaded: @rpath/MapsIndoorsCore.framework/MapsIndoorsCore`.
  # See SPEX-2429 before reintroducing SPM here.
  s.dependency "MapsIndoorsMapbox11", "4.19.1"
  s.dependency "MapsIndoorsCodable", "4.19.1"
end
