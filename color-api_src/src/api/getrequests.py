from fastapi import APIRouter, HTTPException
from controller.request import RequestHandler
from schemas.colorRequest import ColorRequest
from schemas.colorResponse import ColorResponse
from schemas.schemeResult import SchemeResult

router = APIRouter()

@router.get("/scheme", response_model=SchemeResult)
def get_scheme() -> SchemeResult:
    """Return a scheme based on current weather + local time."""
    try:
        return RequestHandler.handle_empty_request()
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.post("/scheme", response_model=ColorResponse)
def get_scheme_for_request(request: ColorRequest) -> ColorResponse:
    """Return a scheme for a given explicit request."""
    try:
        return RequestHandler.handle_request(request)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

