from fastapi import HTTPException, status
from pydantic import BaseModel


class ErrorResponseBase(BaseModel):
    detail: str


def generate_error_response_model(http_exception: HTTPException) -> ErrorResponseBase:
    class ErrorResponse(ErrorResponseBase):
        model_config = {
            "json_schema_extra": {
                "examples": [
                    {
                        "detail": http_exception.detail
                    }
                ]
            }
        }

    return ErrorResponse


FILE_NOT_FOUND = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Ticket file not found"
)

FILE_OVER_SIZE = HTTPException(
    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
    detail="File is too large"
)

MISSING_FILE = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Missing file"
)

PERMISSION_DENIED = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Permission denied"
)

SSH_CONFIG_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="SSH config not found"
)

TICKET_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Ticket not found"
)

USER_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="User not found"
)
