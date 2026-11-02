/**
 * Minimal stand-in for react-native, so the pure TypeScript in src/core can be unit tested in
 * plain Node without installing React Native or booting a simulator.
 *
 * Only what src/core touches at import time is provided. Anything that actually crosses the
 * bridge is a jest.fn(): a unit test that reaches native has strayed out of scope and should live
 * in the on-device suites instead (see mapsindoors-sdk-react-native).
 */
/** React Native's own `PlatformOSType`, so a test can set any value RN can report. */
type PlatformOSType = 'ios' | 'android' | 'macos' | 'windows' | 'web' | 'native';

/**
 * `OS` is mutable: a test can set `Platform.OS = 'android'` to take the Android decode paths.
 * `select` follows it the way React Native does - this platform, then `native`, then `default`.
 */
export const Platform = {
  OS: 'ios' as PlatformOSType,
  select: <T,>(spec: { [os in PlatformOSType | 'default']?: T }): T | undefined =>
    Platform.OS in spec
      ? spec[Platform.OS]
      : Platform.OS !== 'web' && 'native' in spec
        ? spec.native
        : spec.default,
};

/**
 * Every native module resolves to a stable object whose methods are stable jest mocks.
 *
 * Both levels memoize, which they did not use to. src/core destructures its module at import time
 * (`const { MapsIndoorsModule } = NativeModules`), so a test that stubs
 * `NativeModules.MapsIndoorsModule.setLanguage` has to be reaching the very same object the module
 * under test captured. Handing out a fresh proxy per property access made that silently
 * impossible: the stub landed on an object nothing else would ever see.
 *
 * The default implementation *resolves* undefined rather than returning it, because src/core
 * chains `.then` / `.catch` straight onto these calls - a bare undefined throws a TypeError before
 * the test reaches its assertion.
 */
const methodTables: Record<string, Record<string, jest.Mock>> = {};
const moduleProxies: Record<string, Record<string, jest.Mock>> = {};

const moduleProxy = (name: string): Record<string, jest.Mock> => {
  const methods = (methodTables[name] ??= {});
  return new Proxy(methods, {
    get: (target, prop: string) => (target[prop] ??= jest.fn(() => Promise.resolve(undefined))),
  });
};

export const NativeModules: Record<string, Record<string, jest.Mock>> = new Proxy(
  {},
  {
    get: (_target, prop: string) => (moduleProxies[prop] ??= moduleProxy(prop)),
  },
);

/**
 * Drops every stubbed implementation while keeping the module objects src/core captured at import
 * time. Call it from `beforeEach`.
 *
 * jest.config sets `clearMocks`, which only resets call records - a `mockResolvedValue` from one
 * test would otherwise leak into the next. Clearing the method tables in place, rather than
 * replacing the module objects, is what preserves the identity those destructured references hold.
 */
export const resetNativeModules = (): void => {
  for (const methods of Object.values(methodTables)) {
    for (const method of Object.keys(methods)) {
      delete methods[method];
    }
  }
};

/**
 * Returned by addListener. src/core imports this as a type, so it has to exist here too - the
 * jest.config paths mapping makes TypeScript resolve `react-native` to this file, which means a
 * missing export shows up as a type error rather than as undefined at runtime.
 */
export interface EmitterSubscription {
  remove(): void;
}

export class NativeEventEmitter {
  /** MapControl and MapsIndoors both construct one around a native module. */
  constructor(_nativeModule?: Record<string, jest.Mock>) {}

  /**
   * Signature matters here, not just existence. MapControl passes (eventName, listener) and reads
   * the subscription back, so a zero-argument stub typechecks as an error the moment a test pulls
   * MapControl in through `../../index` - which every test of MPSolution or MapsIndoors does.
   */
  addListener = jest.fn(
    (_eventType: string, _listener: (...args: any[]) => void): EmitterSubscription => ({
      remove: jest.fn(),
    }),
  );
  removeAllListeners = jest.fn((_eventType?: string) => undefined);
  emit = jest.fn((_eventType: string, ..._args: any[]) => undefined);
}

export const DeviceEventEmitter = new NativeEventEmitter();

export const TurboModuleRegistry = {
  get: (): null => null,
  getEnforcing: (): Record<string, jest.Mock> =>
    new Proxy({}, { get: () => jest.fn() }) as Record<string, jest.Mock>,
};

/**
 * MapView.tsx calls requireNativeComponent at module scope, so anything that imports `../../index`
 * for a *value* - MPSolution reaches MPSolutionConfig.create through it, MapsIndoors reaches
 * MPError.parse - loads MapView and would die at import without this.
 *
 * The MPBounds / MPFilter / MPPoint tests never hit it: MPFilter's `../../index` import is used
 * purely in type positions, so TypeScript elides the import entirely.
 *
 * UIManager and findNodeHandle are only reached inside the component body, but they still have to
 * exist as exports, for the same paths-mapping reason as EmitterSubscription above.
 */
// `any` rather than the component's real type: MapView renders the returned value as JSX with a
// ref and provider-specific props, and a narrower stand-in would make those a type error here
// without saying anything true about the native component.
export const requireNativeComponent = jest.fn((name: string): any => name);
export const findNodeHandle = jest.fn((_ref?: unknown): number | null => 1);
export const UIManager = {
  dispatchViewManagerCommand: jest.fn(),
  MapsIndoorsView: { Commands: { create: 1 } },
};

export interface ViewProps {
  [key: string]: unknown;
}
