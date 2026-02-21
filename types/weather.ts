export interface WeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
  name: string;
}
