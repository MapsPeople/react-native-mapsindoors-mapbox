import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  loadMapsIndoors(apiKey: string, optionalStrings: Array<string> | null): Promise<null>;
  getDefaultVenue(): Promise<string | null>;
  getVenues(): Promise<string>;
  getBuildings(): Promise<string>;
  getCategories(): Promise<string>;
  getLocations(): Promise<string>;
  disableEventLogging(disable: boolean): Promise<null>;
  getApiKey(): Promise<string>;
  getAvailableLanguages(): Promise<Array<string>>;
  getDefaultLanguage(): Promise<string>;
  getLanguage(): Promise<string>;
  getLocationById(id: string): Promise<string | null>;
  getLocationsByExternalIds(ids: Array<string>): Promise<string>;
  getMapStyles(): Promise<string>;
  getSolution(): Promise<string | null>;
  getLocationsAsync(query: string, filter: string): Promise<string>;
  locationDisplayRuleExists(locationId: string): Promise<boolean>;
  displayRuleNameExists(name: string): Promise<boolean>;
  setPositionProvider(positionProviderName: string): Promise<null>;
  removePositionProvider(): Promise<null>;
  onPositionUpdate(position: string): void;
  getUserRoles(): Promise<string>;
  checkOfflineDataAvailability(): Promise<boolean>;
  destroy(): Promise<null>;
  isApiKeyValid(): Promise<boolean>;
  isInitialized(): Promise<boolean>;
  isReady(): Promise<boolean>;
  setLanguage(lang: string): Promise<boolean>;
  synchronizeContent(): Promise<null>;
  applyUserRoles(userRolesString: string): Promise<null>;
  getAppliedUserRoles(): Promise<string | null>;
  reverseGeoCode(pointString: string): Promise<string>;
  addVenuesToSync(venues: Array<string>): Promise<null>;
  removeVenuesToSync(venues: Array<string>): Promise<null>;
  getSyncedVenues(): Promise<Array<string> | null>;
  cacheData(apiKey: string): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MapsIndoorsModule');
