import Foundation
import React

import MapsIndoors
import MapsIndoorsCore
import MapsIndoorsMapbox
import MapboxMaps

@objc(MapsIndoorsViewManager)
class MapsIndoorsViewManager : RCTViewManager {
    @objc override static func requiresMainQueueSetup() -> Bool {return false}

    override func view() -> UIView! {
        MapboxOptions.accessToken = Bundle.main.object(forInfoDictionaryKey: "MBXAccessToken") as? String ?? ""
        let cameraOptions = CameraOptions(
                            center: CLLocationCoordinate2D(latitude: 0, longitude: 0),
                            zoom: 2,
                            pitch: 0
                        )
        let options = MapInitOptions(cameraOptions: cameraOptions)
        
        let mapView = MapView(frame: CGRect(x: 0, y: 0, width: 64, height: 64), mapInitOptions: options)
        

        MapsIndoorsData.reset()
        MapsIndoorsData.sharedInstance.mapView = MapBoxView(mapboxView: mapView)
        return mapView
    }

    @objc func create(_ node: NSNumber, nodeAgain: NSNumber) {
    }
}

class MapBoxView: RCMapView {
    
    private let mapboxView: MapView
    private var mMapControl: MPMapControl? = nil
    
    init(mapboxView: MapView) {
        self.mapboxView = mapboxView
    }
    
    internal func getMapControl() -> MPMapControl? {
        return mMapControl
    }
    
    func setMapControl(mapControl: any MapsIndoors.MPMapControl) {
        mMapControl = mapControl
    }
    
    private func makeCameraUpdate(cameraUpdate: CameraUpdate) throws -> CameraOptions {
        var update: CameraOptions
        
        switch cameraUpdate.mode {
        case "fromPoint":
            guard let point = cameraUpdate.point else {
                throw CameraUpdateError.missingField("fromPoint", "point")
            }
            let camera = mapboxView.mapboxMap.cameraState
            
            update = CameraOptions(cameraState: camera)
            update.center = point.coordinate

        case "fromBounds":
            guard let bounds = cameraUpdate.bounds else {
                throw CameraUpdateError.missingField("fromBounds", "bounds")
            }
            let camera = mapboxView.mapboxMap.cameraState

            let camerabounds = CameraBoundsOptions(bounds: CoordinateBounds(southwest: bounds.southWest, northeast: bounds.northEast))
            
            update = CameraOptions(cameraState: camera)
            update.center = camerabounds.bounds?.center

        case "zoomBy":
            let camera = mapboxView.mapboxMap.cameraState
            
            update = CameraOptions(cameraState: camera)
            update.zoom = CGFloat(cameraUpdate.zoom!)
            
        case "zoomTo":
            let camera = mapboxView.mapboxMap.cameraState
            
            update = CameraOptions(cameraState: camera)
            update.zoom = CGFloat(cameraUpdate.zoom!)

        case "fromCameraPosition":
            guard let position = cameraUpdate.position else {
                throw CameraUpdateError.missingField("fromCameraPosition", "position")
            }
            let camera = mapboxView.mapboxMap.cameraState
            
            update = CameraOptions(cameraState: camera)
            update.center = position.target.coordinate
            update.bearing = CLLocationDirection(position.bearing)
            update.zoom = CGFloat(position.zoom)
            update.pitch = CGFloat(position.tilt)

        default:
            throw CameraUpdateError.unknownMode(cameraUpdate.mode)
        }
        
        return update
    }
    
    func animateCamera(cameraUpdate: CameraUpdate, duration: Int) throws {
        let cameraOption: CameraOptions
        
        cameraOption = try makeCameraUpdate(cameraUpdate: cameraUpdate)
        
        DispatchQueue.main.async { [self] in
            if (duration != 0) {
                mapboxView.mapboxMap.setCamera(to: cameraOption)
            } else {
                mapboxView.mapboxMap.setCamera(to: cameraOption)
            }
        }
    }
    
    func moveCamera(cameraUpdate: CameraUpdate) throws {
        let cameraOption: CameraOptions
        
        cameraOption = try makeCameraUpdate(cameraUpdate: cameraUpdate)
        
        DispatchQueue.main.async { [self] in
            mapboxView.mapboxMap.setCamera(to: cameraOption)
        }
    }
    
    func getConfig(config: NSDictionary) -> MPMapConfig {
        let mapConfig = MPMapConfig(mapBoxView: mapboxView, accessToken: Bundle.main.object(forInfoDictionaryKey: "MBXAccessToken") as? String ?? "")
        if let zoom = config["mapsIndoorsTransitionLevel"] as? NSNumber {
            mapConfig.setMapsIndoorsTransitionLevel(zoom: zoom.intValue)
        }
        if let showMapMarkers = config["showMapMarkers"] as? Bool {
            mapConfig.setShowMapMarkers(show: showMapMarkers)
        }
        if let showRoadLabels = config["showRoadLabels"] as? Bool {
            mapConfig.setShowRoadLabels(show: showRoadLabels)
        }
        return mapConfig
    }

}
