from asyncssh import (
    connect,
    Error as SSHError,
    SFTPName,
    SFTPNoSuchFile,
    SFTPPermissionDenied,
    SSHClientConnection,
)
from fastapi import (
    APIRouter,
    Body,
    HTTPException,
    status,
)
from fastapi.websockets import (
    WebSocket,
    WebSocketDisconnect,
    WebSocketState
)
from orjson import loads, dumps
from pydantic import BaseModel

from asyncio import get_event_loop
from typing import Literal

from config import SSH_HOST, SSH_PORT
from schemas import generate_ssh_data, SSHData

from ..exceptions import SSH_CONFIG_NOT_FOUND
from ..oauth import UserDepends

router = APIRouter(
    prefix="/ssh",
    tags=["SSH"],
)


class FileData(BaseModel):
    type: Literal["FILE", "DIRECTORY", "LINK"]
    filename: str
    permission: int
    size: int


class ListDir(BaseModel):
    files: list[FileData]
    directories: list[FileData]
    links: list[FileData]


async def create_ssh_client(ssh_data: SSHData) -> SSHClientConnection:
    conn = await connect(
        host=SSH_HOST,
        port=SSH_PORT,
        username=ssh_data.username,
        client_keys=[ssh_data.private_key.encode()],
        known_hosts=None,
    )
    return conn


def parseListdir(data: list[SFTPName]) -> ListDir:
    files = list(map(
        lambda d: FileData(
            type="FILE",
            filename=d.filename,
            permission=oct(d.attrs.permissions)[-3:],
            size=d.attrs.size
        ),
        filter(lambda d: d.attrs.type == 1, data)
    ))
    directories = list(map(
        lambda d: FileData(
            type="DIRECTORY",
            filename=d.filename,
            permission=oct(d.attrs.permissions)[-3:],
            size=d.attrs.size
        ),
        filter(lambda d: d.attrs.type == 2, data)
    ))
    links = list(map(
        lambda d: FileData(
            type="LINK",
            filename=d.filename,
            permission=oct(d.attrs.permissions)[-3:],
            size=d.attrs.size
        ),
        filter(lambda d: d.attrs.type == 3, data)
    ))

    return ListDir(
        files=files,
        directories=directories,
        links=links
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
        conn = await create_ssh_client(ssh_data=ssh_data)
        await conn.run("echo \"Hello World!\"", timeout=3)
        return True
    except:
        return False
    finally:
        if conn:
            conn.close()


@router.websocket(
    path="/ws",
)
async def borwser(ws: WebSocket, user: UserDepends):
    ssh_data = await SSHData.get(user.id)
    if ssh_data is None:
        raise SSH_CONFIG_NOT_FOUND

    await ws.accept()
    ssh_client: SSHClientConnection = None
    try:
        ssh_client = await create_ssh_client(ssh_data=ssh_data)
        sftp_client = await ssh_client.start_sftp_client()

        path = await sftp_client.getcwd()
        file_list = await sftp_client.readdir()
        listdirData = parseListdir(file_list)

        await ws.send_bytes(dumps(listdirData.model_dump()))
        while True:
            data = await ws.receive_text()
            try:
                result = await sftp_client.readdir()
            except:
                pass
            pass
    except WebSocketDisconnect:
        pass
    except:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SSH connect failed."
        )
    finally:
        if ssh_client is not None:
            ssh_client.close()
        if ws.client_state != WebSocketState.DISCONNECTED:
            await ws.close()
