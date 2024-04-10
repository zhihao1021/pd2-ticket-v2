from fastapi import APIRouter

from asyncio import get_event_loop

from schemas import generate_ssh_data, SSHData

from ..oauth import UserDepends

router = APIRouter(
    prefix="/ssh",
    tags=["SSH"],
)


@router.get(
    "/public_key",
    description="Get public key"
)
async def get_public_key(user: UserDepends) -> str:
    ssh_data = await SSHData.get(user.id)
    if ssh_data is None:
        loop = get_event_loop()
        ssh_data = await loop.run_in_executor(None, generate_ssh_data, user.id)
        await ssh_data.save()

    return ssh_data.public_key
