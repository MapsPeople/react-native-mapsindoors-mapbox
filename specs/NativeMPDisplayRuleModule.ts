import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

// Boolean setters pass values as serialized strings (matching existing native implementation)
export interface Spec extends TurboModule {
  isVisible(displayRuleId: string): Promise<boolean | null>;
  setVisible(displayRuleId: string, value: string): Promise<null>;
  isIconVisible(displayRuleId: string): Promise<boolean | null>;
  setIconVisible(displayRuleId: string, value: string): Promise<null>;
  isPolygonVisible(displayRuleId: string): Promise<boolean | null>;
  setPolygonVisible(displayRuleId: string, value: string): Promise<null>;
  isLabelVisible(displayRuleId: string): Promise<boolean | null>;
  setLabelVisible(displayRuleId: string, value: string): Promise<null>;
  isModel2DVisible(displayRuleId: string): Promise<boolean | null>;
  setModel2DVisible(displayRuleId: string, value: string): Promise<null>;
  isWallVisible(displayRuleId: string): Promise<boolean | null>;
  setWallVisible(displayRuleId: string, value: string): Promise<null>;
  isExtrusionVisible(displayRuleId: string): Promise<boolean | null>;
  setExtrusionVisible(displayRuleId: string, value: string): Promise<null>;
  isBadgeVisible(displayRuleId: string): Promise<boolean | null>;
  setBadgeVisible(displayRuleId: string, value: string): Promise<null>;
  isModel3DVisible(displayRuleId: string): Promise<boolean | null>;
  setModel3DVisible(displayRuleId: string, value: string): Promise<null>;

  getZoomFrom(displayRuleId: string): Promise<number | null>;
  setZoomFrom(displayRuleId: string, value: number): Promise<null>;
  getZoomTo(displayRuleId: string): Promise<number | null>;
  setZoomTo(displayRuleId: string, value: number): Promise<null>;

  getIconUrl(displayRuleId: string): Promise<string | null>;
  setIcon(displayRuleId: string, url: string): Promise<null>;
  getIconSize(displayRuleId: string): Promise<string | null>;
  setIconSize(displayRuleId: string, size: string): Promise<null>;
  getIconScale(displayRuleId: string): Promise<number | null>;
  setIconScale(displayRuleId: string, scale: number): Promise<null>;
  getIconPlacement(displayRuleId: string): Promise<number | null>;
  setIconPlacement(displayRuleId: string, placement: number): Promise<null>;

  getLabel(displayRuleId: string): Promise<string | null>;
  setLabel(displayRuleId: string, label: string): Promise<null>;
  getLabelZoomFrom(displayRuleId: string): Promise<number | null>;
  setLabelZoomFrom(displayRuleId: string, value: number): Promise<null>;
  getLabelZoomTo(displayRuleId: string): Promise<number | null>;
  setLabelZoomTo(displayRuleId: string, value: number): Promise<null>;
  getLabelMaxWidth(displayRuleId: string): Promise<number | null>;
  setLabelMaxWidth(displayRuleId: string, value: number): Promise<null>;
  getLabelType(displayRuleId: string): Promise<number | null>;
  setLabelType(displayRuleId: string, value: number): Promise<null>;
  getLabelStyleTextSize(displayRuleId: string): Promise<number | null>;
  setLabelStyleTextSize(displayRuleId: string, value: number): Promise<null>;
  getLabelStyleTextColor(displayRuleId: string): Promise<string | null>;
  setLabelStyleTextColor(displayRuleId: string, value: string): Promise<null>;
  getLabelStyleHaloColor(displayRuleId: string): Promise<string | null>;
  setLabelStyleHaloColor(displayRuleId: string, value: string): Promise<null>;
  getLabelStyleTextOpacity(displayRuleId: string): Promise<number | null>;
  setLabelStyleTextOpacity(displayRuleId: string, value: number): Promise<null>;
  getLabelStyleHaloWidth(displayRuleId: string): Promise<number | null>;
  setLabelStyleHaloWidth(displayRuleId: string, value: number): Promise<null>;
  getLabelStyleHaloBlur(displayRuleId: string): Promise<number | null>;
  setLabelStyleHaloBlur(displayRuleId: string, value: number): Promise<null>;
  getLabelStyleBearing(displayRuleId: string): Promise<number | null>;
  setLabelStyleBearing(displayRuleId: string, value: number): Promise<null>;
  getLabelStylePosition(displayRuleId: string): Promise<number | null>;
  setLabelStylePosition(displayRuleId: string, value: number): Promise<null>;
  getLabelStyleGraphic(displayRuleId: string): Promise<string | null>;
  setLabelStyleGraphic(displayRuleId: string, value: string): Promise<null>;

  getPolygonZoomFrom(displayRuleId: string): Promise<number | null>;
  setPolygonZoomFrom(displayRuleId: string, value: number): Promise<null>;
  getPolygonZoomTo(displayRuleId: string): Promise<number | null>;
  setPolygonZoomTo(displayRuleId: string, value: number): Promise<null>;
  getPolygonStrokeWidth(displayRuleId: string): Promise<number | null>;
  setPolygonStrokeWidth(displayRuleId: string, value: number): Promise<null>;
  getPolygonStrokeColor(displayRuleId: string): Promise<string | null>;
  setPolygonStrokeColor(displayRuleId: string, value: string): Promise<null>;
  getPolygonStrokeOpacity(displayRuleId: string): Promise<number | null>;
  setPolygonStrokeOpacity(displayRuleId: string, value: number): Promise<null>;
  getPolygonFillColor(displayRuleId: string): Promise<string | null>;
  setPolygonFillColor(displayRuleId: string, value: string): Promise<null>;
  getPolygonFillOpacity(displayRuleId: string): Promise<number | null>;
  setPolygonFillOpacity(displayRuleId: string, value: number): Promise<null>;
  getPolygonLightnessFactor(displayRuleId: string): Promise<number | null>;
  setPolygonLightnessFactor(displayRuleId: string, value: number): Promise<null>;

  getWallColor(displayRuleId: string): Promise<string | null>;
  setWallColor(displayRuleId: string, value: string): Promise<null>;
  getWallHeight(displayRuleId: string): Promise<number | null>;
  setWallHeight(displayRuleId: string, value: number): Promise<null>;
  getWallZoomFrom(displayRuleId: string): Promise<number | null>;
  setWallZoomFrom(displayRuleId: string, value: number): Promise<null>;
  getWallZoomTo(displayRuleId: string): Promise<number | null>;
  setWallZoomTo(displayRuleId: string, value: number): Promise<null>;
  getWallLightnessFactor(displayRuleId: string): Promise<number | null>;
  setWallLightnessFactor(displayRuleId: string, value: number): Promise<null>;

  getExtrusionColor(displayRuleId: string): Promise<string | null>;
  setExtrusionColor(displayRuleId: string, value: string): Promise<null>;
  getExtrusionHeight(displayRuleId: string): Promise<number | null>;
  setExtrusionHeight(displayRuleId: string, value: number): Promise<null>;
  getExtrusionZoomFrom(displayRuleId: string): Promise<number | null>;
  setExtrusionZoomFrom(displayRuleId: string, value: number): Promise<null>;
  getExtrusionZoomTo(displayRuleId: string): Promise<number | null>;
  setExtrusionZoomTo(displayRuleId: string, value: number): Promise<null>;
  getExtrusionLightnessFactor(displayRuleId: string): Promise<number | null>;
  setExtrusionLightnessFactor(displayRuleId: string, value: number): Promise<null>;

  getModel2DZoomFrom(displayRuleId: string): Promise<number | null>;
  setModel2DZoomFrom(displayRuleId: string, value: number): Promise<null>;
  getModel2DZoomTo(displayRuleId: string): Promise<number | null>;
  setModel2DZoomTo(displayRuleId: string, value: number): Promise<null>;
  getModel2DWidthMeters(displayRuleId: string): Promise<number | null>;
  setModel2DWidthMeters(displayRuleId: string, value: number): Promise<null>;
  getModel2DHeightMeters(displayRuleId: string): Promise<number | null>;
  setModel2DHeightMeters(displayRuleId: string, value: number): Promise<null>;
  getModel2DBearing(displayRuleId: string): Promise<number | null>;
  setModel2DBearing(displayRuleId: string, value: number): Promise<null>;
  getModel2DModel(displayRuleId: string): Promise<string | null>;
  setModel2DModel(displayRuleId: string, value: string): Promise<null>;

  getBadgeFillColor(displayRuleId: string): Promise<string | null>;
  setBadgeFillColor(displayRuleId: string, value: string): Promise<null>;
  getBadgeStrokeColor(displayRuleId: string): Promise<string | null>;
  setBadgeStrokeColor(displayRuleId: string, value: string): Promise<null>;
  getBadgeRadius(displayRuleId: string): Promise<number | null>;
  setBadgeRadius(displayRuleId: string, value: number): Promise<null>;
  getBadgeStrokeWidth(displayRuleId: string): Promise<number | null>;
  setBadgeStrokeWidth(displayRuleId: string, value: number): Promise<null>;
  getBadgePosition(displayRuleId: string): Promise<number | null>;
  setBadgePosition(displayRuleId: string, value: number): Promise<null>;
  getBadgeScale(displayRuleId: string): Promise<number | null>;
  setBadgeScale(displayRuleId: string, value: number): Promise<null>;
  getBadgeZoomFrom(displayRuleId: string): Promise<number | null>;
  setBadgeZoomFrom(displayRuleId: string, value: number): Promise<null>;
  getBadgeZoomTo(displayRuleId: string): Promise<number | null>;
  setBadgeZoomTo(displayRuleId: string, value: number): Promise<null>;

  getModel3DModel(displayRuleId: string): Promise<string | null>;
  setModel3DModel(displayRuleId: string, value: string): Promise<null>;
  getModel3DRotationX(displayRuleId: string): Promise<number | null>;
  setModel3DRotationX(displayRuleId: string, value: number): Promise<null>;
  getModel3DRotationY(displayRuleId: string): Promise<number | null>;
  setModel3DRotationY(displayRuleId: string, value: number): Promise<null>;
  getModel3DRotationZ(displayRuleId: string): Promise<number | null>;
  setModel3DRotationZ(displayRuleId: string, value: number): Promise<null>;
  getModel3DScale(displayRuleId: string): Promise<number | null>;
  setModel3DScale(displayRuleId: string, value: number): Promise<null>;
  getModel3DZoomFrom(displayRuleId: string): Promise<number | null>;
  setModel3DZoomFrom(displayRuleId: string, value: number): Promise<null>;
  getModel3DZoomTo(displayRuleId: string): Promise<number | null>;
  setModel3DZoomTo(displayRuleId: string, value: number): Promise<null>;

  reset(displayRuleId: string): Promise<null>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DisplayRule');
