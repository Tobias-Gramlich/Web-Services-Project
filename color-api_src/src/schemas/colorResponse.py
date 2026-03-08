from pydantic import BaseModel, field_validator
from pydantic_extra_types.color import Color


class ColorResponse(BaseModel):
    background: Color
    surface: Color
    primary_color: Color
    secondary_color: Color

    @field_validator("*", mode="before")
    @classmethod
    def validate_color(cls, value):
        try:
            return Color(value)
        except Exception:
            raise ValueError(f"Invalid color value: {value}")
