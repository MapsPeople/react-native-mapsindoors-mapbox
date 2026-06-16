import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  venueHasGraph(venueId: string): Promise<boolean>;
  pointAngleBetween(point1: string, point2: string): Promise<number>;
  pointDistanceTo(point1: string, point2: string): Promise<number>;
  geometryIsInside(point: string, geometry: string): Promise<boolean>;
  geometryArea(geometry: string): Promise<number>;
  polygonDistanceToClosestEdge(point: string, geometry: string): Promise<number>;
  parseMapClientUrl(venueId: string, locationId: string): Promise<string>;
  setCollisionHandling(collisionHandling: number): Promise<null>;
  enableClustering(value: boolean): Promise<null>;
  setExtrusionOpacity(opacity: number): Promise<null>;
  setWallOpacity(opacity: number): Promise<null>;
  setNewSelection(value: boolean): Promise<null>;
  setSelectable(settingsId: string, value: boolean): Promise<null>;
  setAutomatedZoomLimit(limit: number): Promise<null>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('UtilsModule');
