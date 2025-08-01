declare module 'circular-natal-horoscope-js' {
  export interface OriginConfig {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    latitude: number;
    longitude: number;
  }

  export interface HoroscopeConfig {
    origin: Origin;
    houseSystem: string;
    zodiac: string;
    aspectPoints: string[];
    aspectWithPoints: string[];
    aspectTypes: string[];
    language: string;
  }

  export class Origin {
    constructor(config: OriginConfig);
  }

  export class Horoscope {
    constructor(config: HoroscopeConfig);
    CelestialBodies: any;
    CelestialPoints: any;
    Houses: any[];
    Aspects: any;
    Ascendant: any;
  }
}