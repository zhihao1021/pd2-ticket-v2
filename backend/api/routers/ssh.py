from asyncssh import (
    connect,
    Error as SSHError,
    SSHClientConnection,
)
from fastapi import APIRouter, Body

from asyncio import get_event_loop

from config import SSH_HOST, SSH_PORT
from schemas import generate_ssh_data, SSHData

from ..exceptions import SSH_CONFIG_NOT_FOUND
from ..oauth import UserDepends

router = APIRouter(
    prefix="/ssh",
    tags=["SSH"],
)


@router.post(
    path="",
    description="Create SSH config."
)
async def create_ssh_config(
    user: UserDepends,
    username: str = Body(embed=True)
) -> str:
    ssh_data = await SSHData.get(user.id)
    if ssh_data is not None:
        return ssh_data.public_key
    loop = get_event_loop()
    ssh_data = await loop.run_in_executor(None, generate_ssh_data, user.id, username)

    await ssh_data.save()

    return ssh_data.public_key


@router.get(
    path="/public_key",
    description="Get public key."
)
async def get_public_key(user: UserDepends) -> str:
    ssh_data = await SSHData.get(user.id)
    if ssh_data is None:
        raise SSH_CONFIG_NOT_FOUND

    return ssh_data.public_key


@router.get(
    path="/test-connection",
    description="Test SSH connection."
)
async def test_connection(user: UserDepends) -> bool:
    ssh_data = await SSHData.get(user.id)
    if ssh_data is None:
        raise SSH_CONFIG_NOT_FOUND

    conn: SSHClientConnection = None
    try:
        conn = await connect(
            host=SSH_HOST,
            port=SSH_PORT,
            username=ssh_data.username,
            client_keys=[ssh_data.private_key.encode()],
            known_hosts=None,
        )
        await conn.run("echo \"Hello World!\"", timeout=3)
        return True
    except:
        return False
    finally:
        if conn:
            conn.close()
