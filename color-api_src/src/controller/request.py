from __future__ import annotations

import datetime as dt
from datetime import date

import requests

from schemas.colorRequest import ColorRequest, DayType, TimeOfDay, WeatherType
from schemas.schemeResult import SchemeResult
from schemas.colorResponse import ColorResponse
from persistence.request_scheme import request_scheme


class RequestHandler:

    @staticmethod
    def handle_request(crequest: ColorRequest) -> ColorResponse:
        """Lookup a scheme for an explicit request."""
        return request_scheme(crequest)

    @staticmethod
    def handle_empty_request() -> SchemeResult:
        """Build a ColorRequest from current weather + local time, then return the matching scheme."""

        # 1) Fetch weather
        url = "https://api.brightsky.dev/current_weather"
        params = {"lon": 9.150514, "lat": 49.354208, "units": "dwd"}

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        weather_data = response.json()

        # 2) Classify weather
        condition = (weather_data.get("weather") or {}).get("condition")
        weather = RequestHandler._map_brightsky_condition(condition)

        # 3) Determine time-of-day
        hour = dt.datetime.now().hour  # 0..23
        if 6 <= hour < 12:
            time_of_day = TimeOfDay.Morning
        elif 12 <= hour < 20:
            time_of_day = TimeOfDay.Midday
        else:
            time_of_day = TimeOfDay.Night

        # 4) Determine day type
        # date.weekday(): Monday=0 ... Sunday=6
        wd = date.today().weekday()
        if wd <= 3:
            day_type = DayType.Weekday
        elif wd == 4:
            day_type = DayType.Friday
        else:
            day_type = DayType.Weekend

        req = ColorRequest(time_of_day=time_of_day, day_type=day_type, weather=weather)
        scheme = request_scheme(req)
        return SchemeResult(request=req, scheme=scheme)

    @staticmethod
    def _map_brightsky_condition(condition: str | None) -> WeatherType:
        """Best-effort mapping from Bright Sky 'condition' field to our enum."""
        if condition is None:
            return WeatherType.Cloudy

        condition = str(condition).strip().lower()

        if condition in {"clear", "null", ""}:
            return WeatherType.Sunny
        if condition in {"rain", "showers"}:
            return WeatherType.Rainy
        if condition in {"snow"}:
            return WeatherType.Snow
        if condition in {"fog", "sleet", "hail", "cloudy", "dry",  "overcast"}:
            return WeatherType.Cloudy
        return WeatherType.Storm
    
if __name__ == "__main__": 
    RequestHandler.handle_empty_request()
