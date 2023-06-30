package com.reactlibrary;

import android.app.Activity;
import android.graphics.Typeface;

import com.facebook.react.bridge.ReadableMap;
import com.mapbox.geojson.Point;
import com.mapbox.maps.CameraOptions;
import com.mapbox.maps.CameraState;
import com.mapbox.maps.CoordinateBounds;
import com.mapbox.maps.EdgeInsets;
import com.mapbox.maps.MapView;
import com.mapsindoors.core.MPIMapConfig;
import com.mapsindoors.core.MPPoint;
import com.mapsindoors.core.OnResultReadyListener;
import com.mapsindoors.mapbox.MPMapConfig;
import com.reactlibrary.core.RCMapView;
import com.reactlibrary.core.models.MPCameraPosition;
import com.reactlibrary.core.models.MPCameraUpdate;

public class MapboxMapView implements RCMapView {
    private MapView mMapView;

    public MapboxMapView(MapView mapView) {
        mMapView = mapView;
    }

    @Override
    public void animateCamera(MPCameraUpdate cameraUpdate, Integer duration, OnResultReadyListener onFinished) {
        CameraOptions cameraOptions = toCameraOptions(cameraUpdate);
        mMapView.getMapboxMap().setCamera(cameraOptions);
        onFinished.onResultReady(null);
    }

    @Override
    public void moveCamera(MPCameraUpdate cameraUpdate) {
        CameraOptions cameraOptions = toCameraOptions(cameraUpdate);
        mMapView.getMapboxMap().setCamera(cameraOptions);
    }

    @Override
    public MPCameraPosition getCurrentCameraPosition() {
        CameraState cameraState = mMapView.getMapboxMap().getCameraState();
        return new MPCameraPosition(Double.valueOf(cameraState.getZoom()).floatValue(),
                Double.valueOf(cameraState.getPitch()).floatValue(),
                Double.valueOf(cameraState.getBearing()).floatValue(),
                new MPPoint(cameraState.getCenter().latitude(), cameraState.getCenter().longitude()));
    }

    @Override
    public MPIMapConfig parseConfig(ReadableMap configMap, Activity activity) {
        String apiKey = activity.getString(R.string.mapbox_api_key);
        boolean useDefaultStyle = !configMap.hasKey("useDefaultMapsIndoorsStyle") || configMap.getBoolean("useDefaultMapsIndoorsStyle");
        MPMapConfig.Builder config = new MPMapConfig.Builder(activity, mMapView.getMapboxMap(), mMapView, apiKey, useDefaultStyle);

        if (configMap.hasKey("typeface")) {
            config.setMapLabelFont(Typeface.create("typeface", Typeface.NORMAL), configMap.getString("color"), configMap.getBoolean("showHalo"));
        }

        if (configMap.hasKey("textSize")) {
            config.setMapLabelTextSize(configMap.getInt("textSize"));
        }

        if (configMap.hasKey("showFloorSelector")) {
            config.setShowFloorSelector(configMap.getBoolean("showFloorSelector"));
        }

        if (configMap.hasKey("showInfoWindowOnClick")) {
            config.setShowInfoWindowOnLocationClicked(configMap.getBoolean("showInfoWindowOnClick"));
        }

        if (configMap.hasKey("showUserPosition")) {
            config.setShowUserPosition(configMap.getBoolean("showUserPosition"));
        }

        if (configMap.hasKey("enableTileFadeIn")) {
            config.setTileFadeInEnabled(configMap.getBoolean("enableTileFadeIn"));
        }

        return config.build();
    }

    public CameraOptions toCameraOptions(MPCameraUpdate cameraUpdate) {
        MPCameraUpdate.CameraUpdateMode mode = cameraUpdate.getMode();
        if (mode == null) {
            return null;
        }

        switch (mode) {
            case FROM_POINT:
                return new CameraOptions.Builder().center(Point.fromLngLat(cameraUpdate.point.getLng(), cameraUpdate.point.getLat())).build();
            case FROM_BOUNDS:
                Point southWest = Point.fromLngLat(cameraUpdate.bounds.getSouthWest().getLng(), cameraUpdate.bounds.getSouthWest().getLat());
                Point northEast = Point.fromLngLat(cameraUpdate.bounds.getNorthEast().getLng(), cameraUpdate.bounds.getNorthEast().getLat());
                CoordinateBounds coordinateBounds = new CoordinateBounds(southWest, northEast);
                return mMapView.getMapboxMap().cameraForCoordinateBounds(coordinateBounds, new EdgeInsets(0,0,0,0), null, null);
            case ZOOM_BY:
                return new CameraOptions.Builder().zoom(mMapView.getMapboxMap().getCameraState().getZoom() + cameraUpdate.zoom).build();
            case ZOOM_TO:
                return new CameraOptions.Builder().zoom(Double.valueOf(cameraUpdate.zoom)).build();
            case FROM_CAMERA_POSITION:
                return new CameraOptions.Builder()
                        .center(Point.fromLngLat(cameraUpdate.position.target.getLng(), cameraUpdate.position.target.getLat()))
                        .zoom(Double.valueOf(cameraUpdate.position.zoom))
                        .bearing(Double.valueOf(cameraUpdate.position.bearing))
                        .pitch(Double.valueOf(cameraUpdate.position.tilt))
                        .build();
        }
        return null;
    }

}
