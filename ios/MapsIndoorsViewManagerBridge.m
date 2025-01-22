#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(MapsIndoorsViewManager, RCTViewManager)
RCT_EXTERN_METHOD(requiresMainQueueSetup)

    RCT_EXTERN_METHOD(create:(nonnull NSNumber) node
                  nodeAgain:(nonnull NSNumber) nodeAgain
                  camera: (NSString*) camera
                  showCompass: (BOOL) showCompass
                  mapboxMapStyle: (NSString*) mapboxMapStyle)
@end
