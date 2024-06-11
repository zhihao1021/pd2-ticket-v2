from beanie import Document
from pydantic import BaseModel, Field, field_validator

from datetime import datetime
from typing import Optional, Union


class AccessTokenResponse(BaseModel):
    access_token: str = ""
    token_type: str = "Bearer"
    expires_in: int = 604800
    refresh_token: str = ""
    scope: str = "identify"


class DiscordUserBase(BaseModel):
    id: str = Field(
        title="UserID",
        description="Discord user id."
    )
    username: str = Field(
        title="UserName",
        description="Discord username."
    )
    global_name: Optional[str] = Field(
        title="UserDisplayName",
        description="Discord user's global name."
    )
    avatar: Optional[str] = Field(
        title="UserAvatar",
        description="URL of discord user's avatar."
    )


class DisplayDiscordUser(DiscordUserBase):
    is_admin: bool = Field(
        title="IsAdmin",
        description="Whether user is admin."
    )
    display_name: str = Field(
        title="UserDisplayName",
        description="User's display name."
    )
    display_avatar: str = Field(
        title="UserAvatar",
        description="URL of user's avatar."
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "is_admin": False,
                    "display_name": "User",
                    "display_avatar": "https://cdn.discordapp.com/embed/avatars/0.png",
                }
            ]
        }
    }


class JWTData(DisplayDiscordUser):
    exp: datetime
    iat: datetime

    @field_validator("exp", "iat")
    @classmethod
    def datetime_check(cls, v: Union[datetime, int]):
        try:
            return datetime.fromtimestamp(v) if type(v) is not datetime else v
        except:
            raise ValueError


class JWT(BaseModel):
    token_type: str = "Bearer"
    access_token: str


class StorageData(Document):
    id: str
    token_data: AccessTokenResponse
    display_data: DisplayDiscordUser


class StorageDataView(BaseModel):
    display_data: DisplayDiscordUser = Field(
        title="UserDisplaydata",
        description="The user data but only with display_data field."
    )
