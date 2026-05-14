declare namespace NodeJS {
  interface ProcessEnv {
    readonly NG_APP_ENV?: string;
    readonly GUIDES_BASE_API_URL?: string;
    readonly GUIDES_API_KEY?: string;
    readonly WEATHER_API_KEY?: string;
  }
}
