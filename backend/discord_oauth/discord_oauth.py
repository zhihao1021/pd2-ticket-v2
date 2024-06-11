from aiohttp import ClientSession
from fastapi import APIRouter, Body, Security, status
from fastapi.exceptions import HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import decode, encode
from orjson import loads

from datetime import datetime, timedelta, timezone
from os import urandom
from os.path import isdir
from typing import Literal

from .schemas import (
    AccessTokenResponse,
    DiscordUserBase,
    DisplayDiscordUser,
    JWTData,
    JWT,
    StorageData
)

security = HTTPBearer(
    scheme_name="JWT",
    description="JWT which get from posting discord oauth code to /oauth."
)

DISCORD_API = "https://discord.com/api/v10"

class DiscordOAuthRouter:
    router: APIRouter = APIRouter(
        prefix="/oauth",
        tags=["Discord OAuth"]
    )
    redirect_uri: str = ""
    client_id: str = ""
    client_secret: str = ""
    key: str = urandom(16).hex()
    admins: list[str] = []

    def __init__(
        self,
        redirect_uri: str,
        client_id: str,
        client_secret: str,
        key: str = urandom(16).hex(),
        prefix: str = "/oauth",
        admins: list[str] = []
    ) -> None:
        self.router.prefix = prefix

        self.redirect_uri = redirect_uri
        self.client_id = client_id
        self.client_secret = client_secret

        self.key = key
        self.admins = admins

        self.router.add_api_route(
            path="",
            endpoint=self.oauth,
            response_model=JWT,
            status_code=status.HTTP_200_OK,
            description="Get token by discord code",
            methods=["POST"]
        )
        self.router.add_api_route(
            path="",
            endpoint=self.refresh,
            response_model=JWT,
            status_code=status.HTTP_200_OK,
            description="Refresh token",
            methods=["PUT"]
        )

    async def _request_to_discord(
        self,
        token: str,
        grant_type: Literal["authorization_code", "refresh_token"]
    ) -> JWT:
        # Exchange token
        async with ClientSession(headers={"Content-Type": "application/x-www-form-urlencoded"}) as client:
            data = {
                "grant_type": "authorization_code",
                "code": token,
                "redirect_uri": self.redirect_uri
            } if grant_type == "authorization_code" else {
                "grant_type": "refresh_token",
                "refresh_token": token
            }
            data["client_id"] = self.client_id
            data["client_secret"] = self.client_secret
            response = await client.post(
                f"{DISCORD_API}/oauth2/token",
                data=data,
            )
            # Valid failed
            if response.status != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authorize failed"
                )
            token_data = AccessTokenResponse(
                **loads(await response.content.read())
            )

        if "identify" not in token_data.scope:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorize failed"
            )
        # Fetch user data
        async with ClientSession(headers={"Authorization": f"{token_data.token_type} {token_data.access_token}"}) as client:
            response = await client.get(
                f"{DISCORD_API}/users/@me"
            )
            user_data = DiscordUserBase(
                **loads(await response.content.read())
            )

        # Create display data
        display_name = user_data.global_name or user_data.username
        display_avatar = f"https://cdn.discordapp.com/avatars/{user_data.id}/{user_data.avatar}.png" \
            if user_data.avatar else "https://cdn.discordapp.com/embed/avatars/0.png"
        display_data = DisplayDiscordUser(
            **user_data.model_dump(),
            **{
                "is_admin": user_data.id in self.admins,
                "display_name": display_name,
                "display_avatar": display_avatar,
            }
        )

        # Save file to local
        storage_data = StorageData(
            id=user_data.id,
            token_data=token_data,
            display_data=display_data
        )
        await storage_data.save()

        # Generate JWT Data
        utc_now = datetime.now(tz=timezone.utc)
        jwt_data = JWTData(**display_data.model_dump(), **{
            "exp": utc_now + timedelta(seconds=token_data.expires_in),
            "iat": utc_now,
        })

        # Generate JWT
        jwt_payload = jwt_data.model_dump()
        jwt = encode(
            payload=jwt_payload,
            key=self.key,
            algorithm="HS256"
        )

        return JWT(access_token=jwt)

    async def valid_token(self, token: HTTPAuthorizationCredentials = Security(security)) -> JWTData:
        jwt = token.credentials
        try:
            decode_data = JWTData(**decode(
                jwt=jwt,
                key=self.key,
                algorithms=["HS256"],
                options={
                    "require": ["exp", "iat"]
                }
            ))
            return decode_data
        except:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication credentials"
            )

    async def oauth(
        self,
        code: str = Body(embed=True)
    ) -> JWT:
        return await self._request_to_discord(code, grant_type="authorization_code")

    async def refresh(self, token: HTTPAuthorizationCredentials = Security(security)) -> JWT:
        # Decode JWT
        try:
            jwt = token.credentials
            jwt_data = JWTData(**decode(
                jwt=jwt,
                key=self.key,
                algorithms=["HS256"],
                options={
                    "require": ["exp", "iat"],
                    "verify_exp": False
                }
            ))
        except:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication credentials"
            )

        if jwt_data.exp - datetime.now(timezone.utc) > timedelta(days=1):
            return JWT(access_token=jwt)

        # Read User Data
        storage_data = await StorageData.get(jwt_data.id)

        return await self._request_to_discord(
            token=storage_data.token_data.refresh_token,
            grant_type="refresh_token"
        )
