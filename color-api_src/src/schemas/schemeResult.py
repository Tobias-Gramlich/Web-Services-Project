from __future__ import annotations

from pydantic import BaseModel

from schemas.colorRequest import ColorRequest
from schemas.colorResponse import ColorResponse


class SchemeResult(BaseModel):
    request: ColorRequest
    scheme: ColorResponse
