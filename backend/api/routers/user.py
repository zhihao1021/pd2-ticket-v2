from fastapi import APIRouter

from discord_oauth import DisplayDiscordUser, StorageData

from ..exceptions import USER_NOT_FOUND
from ..oauth import UserDepends

router = APIRouter(
    prefix="/user",
    tags=["User"],
)

@router.get(
    "/{user_id}",
    response_model=DisplayDiscordUser,
    description="Get special user's info"
)
async def get_user(user: UserDepends, user_id: str) -> DisplayDiscordUser:
    if user_id == user.id:
        return user
    result = await StorageData.get(user_id)
    if result is None:
        raise USER_NOT_FOUND
    
    return result.display_data
