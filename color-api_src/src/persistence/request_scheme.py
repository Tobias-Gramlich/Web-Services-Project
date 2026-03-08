from __future__ import annotations

from persistence.connection import get_connection
from schemas.colorRequest import ColorRequest
from schemas.colorResponse import ColorResponse
from pydantic_extra_types.color import Color


def request_scheme(req: ColorRequest) -> ColorResponse:
    # Normalize inputs
    time_of_day = req.time_of_day.value
    day_type = req.day_type.value
    weather = req.weather.value

    key = f"{time_of_day}:{day_type}:{weather}"

    sql = """
        SELECT background, surface, primary_color, secondary_color
        FROM color_palette
        WHERE palette_key = ?
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (key,))
            row = cur.fetchone()

    if row is None:
        raise LookupError(f"No color scheme found for palette_key={key!r}")

    return ColorResponse(
        background=Color(row[0]),
        surface=Color(row[1]),
        primary_color=Color(row[2]),
        secondary_color=Color(row[3]),
    )

if __name__ == "__main__":
    req = ColorRequest(
        time_of_day="Morning",
        day_type="Weekend",
        weather="Rainy"
    )
    print(request_scheme(req))