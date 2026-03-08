from enum import Enum
from pydantic import BaseModel, Field


class TimeOfDay(str, Enum):
    Morning = "Morning"
    Midday = "Midday"
    Night = "Night"


class DayType(str, Enum):
    Weekday = "Weekday"
    Friday = "Friday"
    Weekend = "Weekend"


class WeatherType(str, Enum):
    Sunny = "Sunny"
    Rainy = "Rainy"
    Storm = "Storm"
    Snow = "Snow"
    Cloudy = "Cloudy"


class ColorRequest(BaseModel):
    time_of_day: TimeOfDay = Field(
        ...,
        description="Time of the day",
        examples=["Morning"]
    )
    day_type: DayType = Field(
        ...,
        description="Type of the day",
        examples=["Weekday"]
    )
    weather: WeatherType = Field(
        ...,
        description="Current weather condition",
        examples=["Sunny"]
    )
