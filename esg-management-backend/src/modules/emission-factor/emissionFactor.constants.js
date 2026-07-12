/**
 * Emission Factor Module Constants
 */

export const SOURCE_TYPE = {
  PURCHASE: 'PURCHASE',
  MANUFACTURING: 'MANUFACTURING',
  FLEET: 'FLEET',
  EXPENSE: 'EXPENSE',
  ENERGY: 'ENERGY',
  TRANSPORT: 'TRANSPORT',
  GENERAL: 'GENERAL',
};

export const ALLOWED_SOURCE_TYPES = Object.values(SOURCE_TYPE);

export const UNIT_TYPE = {
  LITER: 'LITER',
  KG: 'KG',
  TON: 'TON',
  KM: 'KM',
  KWH: 'KWH',
  M3: 'M3',
  UNIT: 'UNIT',
};

export const ALLOWED_UNIT_TYPES = Object.values(UNIT_TYPE);

export const CO2_UNIT = {
  KG_CO2E: 'kgCO2e',
  T_CO2E: 'tCO2e',
};

export const ALLOWED_CO2_UNITS = Object.values(CO2_UNIT);

export const EMISSION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const ALLOWED_EMISSION_STATUSES = Object.values(EMISSION_STATUS);
