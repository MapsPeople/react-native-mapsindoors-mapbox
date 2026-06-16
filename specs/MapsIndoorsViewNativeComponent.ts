import type {HostComponent, ViewProps} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

// The MapsIndoors map view has no custom props — it is controlled entirely
// via commands sent through UIManager / the MapControlModule.
export interface NativeProps extends ViewProps {}

export default codegenNativeComponent<NativeProps>(
  'MapsIndoorsView',
) as HostComponent<NativeProps>;
