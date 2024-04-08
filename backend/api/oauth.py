from fastapi import Depends

from typing import Annotated

from config import (
    DISCORD_ADMINS,
    DISCORD_REDIRECT_URI,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    KEY,
)
from discord_oauth import DiscordOAuthRouter, JWTData

discord_oauth_router = DiscordOAuthRouter(
    redirect_uri=DISCORD_REDIRECT_URI,
    client_id=DISCORD_CLIENT_ID,
    client_secret=DISCORD_CLIENT_SECRET,
    key=KEY,
    admins=DISCORD_ADMINS
)

user_depends = Depends(discord_oauth_router.valid_token)
UserDepends = Annotated[JWTData, user_depends]
