import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  createService(): Promise<string>;
  addAvoidWayType(wayType: string, id: string): Promise<null>;
  clearWayType(id: string): Promise<null>;
  addExcludeWayType(wayType: string, id: string): Promise<null>;
  clearExcludeWayType(id: string): Promise<null>;
  setIsDeparture(isDeparture: boolean, id: string): Promise<null>;
  getRoute(
    originString: string,
    destinationString: string,
    stops: Array<string> | null,
    optimized: boolean,
    id: string,
  ): Promise<Object>;
  setTravelMode(travelMode: string, id: string): Promise<null>;
  setTime(time: number, id: string): Promise<null>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DirectionsService');
