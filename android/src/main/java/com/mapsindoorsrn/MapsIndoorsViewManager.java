package com.mapsindoorsrn;

import android.view.Choreographer;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.LifecycleRegistry;
import androidx.lifecycle.ViewTreeLifecycleOwner;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactPropGroup;
import com.google.gson.Gson;
import com.mapbox.geojson.Point;
import com.mapbox.maps.CameraOptions;
import com.mapbox.maps.CameraState;
import com.mapbox.maps.GlyphsRasterizationMode;
import com.mapbox.maps.GlyphsRasterizationOptions;
import com.mapbox.maps.MapInitOptions;
import com.mapbox.maps.MapView;
import com.mapbox.maps.plugin.compass.CompassUtils;
import com.mapsindoors.core.OnResultReadyListener;
import com.mapsindoorsrn.core.models.MPCameraPosition;

import java.util.HashMap;
import java.util.Map;

public class MapsIndoorsViewManager extends ViewGroupManager<MapView> {
    public static final String REACT_CLASS = "MapsIndoorsView";
    public final int COMMAND_CREATE = 1;

    private int propWidth;
    private int propHeight;
    private Gson gson;

    private MapView view;

    // A ViewManager is shared across every instance of its view type, so the per-view lifecycle owners are
    // tracked here keyed by MapView rather than as a single field. Cleanup is manual: entries are removed in
    // onDropViewInstance (which React Native calls when the view is unmounted). A plain HashMap, not a
    // WeakHashMap: Mapbox installs its lifecycle observer against the owner (the value), and that observer
    // holds the MapView, so a weak key would be kept reachable by its own value and never clear.
    private final Map<MapView, MapViewLifecycleOwner> lifecycleOwners = new HashMap<>();

    ReactApplicationContext mReactContext;
    OnResultReadyListener mOnMapReadyCallback;

    public MapsIndoorsViewManager(ReactApplicationContext reactContext, OnResultReadyListener onMapReadyCallback) {
        mReactContext = reactContext;
        mOnMapReadyCallback = onMapReadyCallback;
        gson = new Gson();

        // SPEX-2030: also gate the map lifecycle on the host (Activity) foreground state. The view stays
        // attached to the window when the app is merely backgrounded (home button / app switch), so the
        // attach listener alone would leave the renderer RESUMED and burning GL/battery in the background.
        // React Native's host lifecycle (onHostResume/onHostPause) gives us the Activity foreground signal.
        mReactContext.addLifecycleEventListener(new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                setHostResumedOnAll(true);
            }

            @Override
            public void onHostPause() {
                setHostResumedOnAll(false);
            }

            @Override
            public void onHostDestroy() {
                setHostResumedOnAll(false);
            }
        });
    }

    private void setHostResumedOnAll(boolean hostResumed) {
        for (MapViewLifecycleOwner owner : lifecycleOwners.values()) {
            owner.setHostResumed(hostResumed);
        }
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected MapView createViewInstance(@NonNull ThemedReactContext reactContext) {
        // textureView = true (5th positional arg): a TextureView lives in the normal view hierarchy
        // and is restored across detach/reattach, unlike the default SurfaceView whose surface is
        // torn down when react-native-screens detaches the screen on navigation.
        MapInitOptions options = new MapInitOptions(reactContext, MapInitOptions.Companion.getDefaultMapOptions(reactContext).toBuilder()
                .glyphsRasterizationOptions(new GlyphsRasterizationOptions.Builder().rasterizationMode(GlyphsRasterizationMode.ALL_GLYPHS_RASTERIZED_LOCALLY).build()).build(),
                MapInitOptions.Companion.getDefaultPluginList(), new CameraOptions.Builder().pitch(0.0).build(),
                true);
        final MapView mapView = new MapView(reactContext, options);

        // Give the MapView an SDK-owned lifecycle and set it as the view's own ViewTreeLifecycleOwner.
        // ViewTreeLifecycleOwner.get() checks the view itself before walking up the tree, so this wins
        // over the per-screen LifecycleOwner that react-native-screens installs on the ancestor. That
        // stops Mapbox v11 from binding its renderer to the screen lifecycle (which goes ON_STOP on
        // navigate-away and is not reliably brought back to RESUMED on return -> black map).
        // The owner is RESUMED only when the view is attached AND the host Activity is in the foreground;
        // detaching (navigation) or backgrounding the app drives it to CREATED, which stops the renderer
        // and releases the surface.
        final MapViewLifecycleOwner lifecycleOwner = new MapViewLifecycleOwner();
        lifecycleOwner.setHostResumed(mReactContext.getLifecycleState() == LifecycleState.RESUMED);
        ViewTreeLifecycleOwner.set(mapView, lifecycleOwner);
        lifecycleOwners.put(mapView, lifecycleOwner);

        mapView.addOnAttachStateChangeListener(new View.OnAttachStateChangeListener() {
            @Override
            public void onViewAttachedToWindow(@NonNull View v) {
                lifecycleOwner.setAttached(true); // -> RESUMED if host is foreground (restores renderer/surface)
            }

            @Override
            public void onViewDetachedFromWindow(@NonNull View v) {
                lifecycleOwner.setAttached(false); // -> CREATED (stop rendering while off-screen)
            }
        });

        view = mapView;
        return mapView;
    }

    @Override
    public void onDropViewInstance(@NonNull MapView view) {
        super.onDropViewInstance(view);
        MapViewLifecycleOwner lifecycleOwner = lifecycleOwners.remove(view);
        if (lifecycleOwner != null) {
            // Driving the lifecycle to DESTROYED lets the MapView's lifecycle observer tear it down on
            // ON_DESTROY in v11; this releases the renderer/surface and avoids leaking the MapView.
            lifecycleOwner.destroy();
        }
        if (this.view == view) {
            this.view = null;
        }
    }

    /**
     * A self-contained {@link LifecycleOwner} for a single MapView, so the map's renderer follows the
     * view's own attach + host-foreground state rather than the per-screen LifecycleOwner that
     * react-native-screens installs. RESUMED only when the view is attached AND the host Activity is in
     * the foreground; otherwise CREATED (renderer stopped, surface released). This both fixes the
     * navigate-away/back black map and stops the renderer when the app is backgrounded.
     */
    static class MapViewLifecycleOwner implements LifecycleOwner {
        private final LifecycleRegistry registry = new LifecycleRegistry(this);
        private boolean attached = false;
        private boolean hostResumed = false;
        private boolean destroyed = false;

        MapViewLifecycleOwner() {
            registry.setCurrentState(Lifecycle.State.INITIALIZED);
        }

        void setAttached(boolean attached) {
            this.attached = attached;
            sync();
        }

        void setHostResumed(boolean hostResumed) {
            this.hostResumed = hostResumed;
            sync();
        }

        void destroy() {
            destroyed = true;
            registry.setCurrentState(Lifecycle.State.DESTROYED);
        }

        private void sync() {
            if (destroyed) {
                return;
            }
            registry.setCurrentState((attached && hostResumed) ? Lifecycle.State.RESUMED : Lifecycle.State.CREATED);
        }

        @NonNull
        @Override
        public Lifecycle getLifecycle() {
            return registry;
        }
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of("create", COMMAND_CREATE);
    }

    @Override
    public void receiveCommand(@NonNull MapView root, int commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        if (commandId == COMMAND_CREATE) {
            int reactNativeViewId = args.getInt(0);

            createMapFragment(root, reactNativeViewId);

            if (!args.isNull(1)) {
                MPCameraPosition cameraPosition = gson.fromJson(args.getString(1), MPCameraPosition.class);
                CameraState cameraState = view.getMapboxMap().getCameraState();
                view.getMapboxMap().setCamera(new CameraOptions.Builder()
                        .center(Point.fromLngLat(cameraPosition.target.getLng(), cameraPosition.target.getLat()))
                        .zoom(cameraPosition.zoom != null ? Double.valueOf(cameraPosition.zoom) : cameraState.getZoom())
                        .pitch(cameraPosition.tilt != null ? Double.valueOf(cameraPosition.tilt) : cameraState.getPitch())
                        .bearing(cameraPosition.bearing != null ? Double.valueOf(cameraPosition.bearing) : cameraState.getBearing())
                        .build());
            }

            if (!args.isNull(2)) {
                if (args.getBoolean(2)) {
                    CompassUtils.getCompass(view).setEnabled(true);
                }else {
                    CompassUtils.getCompass(view).setEnabled(false);
                }
            }

            if (!args.isNull(3)) {
                view.getMapboxMap().loadStyle(args.getString(3));
            }
        }
    }

    @Override
    public void receiveCommand(@NonNull MapView root, String commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        assert args != null;
        int reactNativeViewId = args.getInt(0);
        int commandIdInt = Integer.parseInt(commandId);

        if (commandIdInt == COMMAND_CREATE) {
            createMapFragment(root, reactNativeViewId);

            if (!args.isNull(1)) {
                MPCameraPosition cameraPosition = gson.fromJson(args.getString(1), MPCameraPosition.class);
                CameraState cameraState = view.getMapboxMap().getCameraState();
                view.getMapboxMap().setCamera(new CameraOptions.Builder()
                        .center(Point.fromLngLat(cameraPosition.target.getLng(), cameraPosition.target.getLat()))
                        .zoom(cameraPosition.zoom != null ? Double.valueOf(cameraPosition.zoom) : cameraState.getZoom())
                        .pitch(cameraPosition.tilt != null ? Double.valueOf(cameraPosition.tilt) : cameraState.getPitch())
                        .bearing(cameraPosition.bearing != null ? Double.valueOf(cameraPosition.bearing) : cameraState.getBearing())
                        .build());
            }

            if (!args.isNull(2)) {
                if (args.getBoolean(2)) {
                    CompassUtils.getCompass(view).setEnabled(true);
                }else {      
                    CompassUtils.getCompass(view).setEnabled(false);
                }
            }

            if (!args.isNull(3)) {
                view.getMapboxMap().loadStyle(args.getString(3));
            }
        }
    }

    public void createMapFragment(FrameLayout root, int reactNativeViewId) {
        ViewGroup parentView = root.findViewById(reactNativeViewId);
        setupLayout(parentView);
        mOnMapReadyCallback.onResultReady(null);
    }

    @ReactPropGroup(names = {"width", "height"}, customType = "Style")
    public void setStyle(FrameLayout view, int index, Integer value) {
        if (index == 0) {
            propWidth = value;
        }

        if (index == 1) {
            propHeight = value;
        }
    }

    public void setupLayout(View view) {
        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren(view);
                view.getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    /**
     * Layout all children properly
     */
    public void manuallyLayoutChildren(View view) {

        float density = mReactContext.getResources().getDisplayMetrics().density;

        // propWidth and propHeight coming from react-native props
        int width = (int)(propWidth * density);
        int height = (int)(propHeight * density);

        view.measure(
                View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY));

        view.layout(0, 0, width, height);
    }

    public MapView getView() {
        return view;
    }
}
