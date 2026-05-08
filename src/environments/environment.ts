export const environment = {
  production: false,
  /** https://www.weatherapi.com/ — Search & Current weather. Leave empty to disable search until configured. */
  weatherApiKey: '' as string,
  /** Base URL for greenhouse REST API (`POST /greenhouses`, `POST /greenhouses/:id/plants`). No trailing slash. */
  greenhouseApiBaseUrl:
    'https://greenhouse-api-python-zuzanna-bycnfkakf2emg8dt.canadacentral-01.azurewebsites.net/api',
};
