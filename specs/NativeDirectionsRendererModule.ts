import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  addListener(eventName: string): void;
  removeListeners(count: number): void;

  clear(): Promise<null>;
  getSelectedLegFloorIndex(): Promise<number>;
  nextLeg(): Promise<null>;
  previousLeg(): Promise<null>;
  selectLegIndex(legIndex: number): Promise<null>;
  setCameraViewFitMode(cameraFitMode: number): Promise<null>;
  setCameraAnimationDuration(duration: number): Promise<null>;
  setOnLegSelectedListener(): Promise<null>;
  setRoute(routeString: string, stopIcons: string, legIndex: number): Promise<null>;
  setAnimatedPolyline(animated: boolean, repeated: boolean, duration: number): Promise<null>;
  setPolyLineColors(foregroundString: string, backgroundString: string): Promise<null>;
  showRouteLegButtons(value: boolean): Promise<null>;
  setDefaultRouteStopIcon(iconString: string): Promise<null>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DirectionsRenderer');
