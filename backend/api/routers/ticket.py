from aiofiles import open as async_open
from fastapi import (
    APIRouter,
    Form,
    status,
    UploadFile,
)
from fastapi.responses import (
    FileResponse,
    StreamingResponse,
)

from asyncio import create_task, gather, get_event_loop
from io import BytesIO
from os import makedirs, remove
from os.path import isdir, isfile, join, split
from pathlib import Path
from re import search
from shutil import make_archive
from typing import Annotated, Union

from config import DATA_DIR, SINGLE_FILE_SIZE
from discord_oauth import (
    INVALIDE_AUTHENTICATION_CREDENTIALS,
    DiscordUserBase,
    JWTData,
    StorageData,
)
from schemas import (
    TicketData,
    TicketDataView,
    TicketDataViewNoAuthor,
    TicketDataCreate,
    TicketDataUpdate,
)

from ..exceptions import (
    generate_error_response_model,
    FILE_OVER_SIZE,
    FILE_NOT_FOUND,
    MISSING_FILE,
    PERMISSION_DENIED,
    TICKET_NOT_FOUND,
    USER_NOT_FOUND,
)
from ..oauth import UserDepends

TICKET_ROOT = join(DATA_DIR, "tickets")

router = APIRouter(
    prefix="/ticket",
    tags=[
        "Ticket",
    ],
    responses={
        401: {
            "description": "Invalid authentication credentials",
            "model": generate_error_response_model(INVALIDE_AUTHENTICATION_CREDENTIALS)
        }
    }
)


def under_ticket_checker(filename: str) -> bool:
    """
    Check file path under the data directory
    """

    if search("[:*?\"<>|~]", filename) is not None:
        return False

    # Save directory
    save_directory = Path(join(TICKET_ROOT, "tickets", "temp")).resolve()
    # Target path
    target_path = Path(join(save_directory, filename)).resolve()
    # Check if target path under save directory path
    return target_path.is_relative_to(save_directory)


def uploadfile_checker(file: UploadFile) -> bool:
    """
    Chcek file has filename and not oversize
    """

    # Check if file format is legal
    if file.filename is None or file.size is None:
        return False

    # Check if file oversize
    if file.size > SINGLE_FILE_SIZE:
        raise FILE_OVER_SIZE

    return under_ticket_checker(file.filename)


async def save_uploadfile(
    save_directory: str,
    file: UploadFile
):
    """
    Save file into filesystem
    """

    # Save UploadFile content to file system
    assert file.filename is not None
    filepath = join(save_directory, file.filename)

    # Check whether directory exist
    target_directory = split(filepath)[0]
    if not isdir(target_directory):
        makedirs(target_directory)

    # Write
    async with async_open(filepath, "wb") as fp:
        await fp.write(await file.read())


async def get_user_ticket_list(
    user: Union[StorageData, DiscordUserBase, str],
    offset: int = 0,
    length: int = 10,
    no_author: bool = False,
    only_public: bool = False,
) -> Union[list[TicketDataView], list[TicketDataViewNoAuthor]]:
    """
    Get a ticket list of user
    """

    # If user type is not StorageData
    if type(user) is not StorageData:
        # Check whether user is id
        if type(user) is not str:
            # If not, try to get user id
            if not hasattr(user, "id"):
                raise TypeError

            user = user.id
        # Make sure user is id
        assert type(user) is str

        # Check if user exist
        user = await StorageData.get(user)
        if user is None:
            raise USER_NOT_FOUND

    # Make sure user type is StorageData
    assert type(user) is StorageData

    # Get ticket list which belong to user
    query_stat = [TicketData.author.id == user.id]
    if only_public:
        query_stat.append(TicketData.is_public == True)

    # Query DB
    result = await TicketData.find(
        *query_stat,
        skip=max(offset, 0),
        limit=max(length, 1),
        sort=(-TicketData.create_time),
        fetch_links=no_author == False,
    ).project(
        TicketDataViewNoAuthor
        if no_author else TicketDataView
    ).to_list()

    # Return
    return result


async def get_ticket_with_permission(
    user: JWTData,
    user_id: str,
    ticket_id: str,
) -> TicketDataView:
    """
    Get the ticket data and make sure that user has permission access it
    """

    # Replace self sign
    if user_id == "@me":
        user_id = user.id

    # Check permission
    only_public = user.id != user_id and not user.is_admin

    # Generate query state
    query_stat = [
        TicketData.id == ticket_id,
        TicketData.author.id == user_id
    ]
    if only_public:
        query_stat.append(TicketData.is_public == True)

    # Query DB
    ticket = await TicketData.find_one(
        *query_stat,
        fetch_links=True
    ).project(TicketDataView)

    # If ticket not found
    if ticket is None:
        raise TICKET_NOT_FOUND

    # If ticket file not exist(a ticket should has file)
    if not isdir(join(TICKET_ROOT, ticket_id)):
        # A ticket with no fil should not exist
        await TicketData.find_one(
            *query_stat,
        ).delete()
        raise TICKET_NOT_FOUND

    return ticket


@router.get(
    path="",
    response_model=list[TicketDataViewNoAuthor],
    description="Get your ticket list",
    status_code=status.HTTP_200_OK,
)
async def self_ticket_list(
    user: UserDepends,
    offset: int = 0,
    length: int = 10,
) -> list[TicketDataViewNoAuthor]:
    return await get_user_ticket_list(
        user.id,
        offset=offset,
        length=length,
        no_author=True
    )


@router.post(
    path="",
    response_model=TicketDataView,
    description="Create ticket",
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {
            "description": "Some file upload by user is too large.",
            "model": generate_error_response_model(FILE_OVER_SIZE)
        },
        413: {
            "description": "The user does not upload any file or no any legal files.",
            "model": generate_error_response_model(MISSING_FILE)
        },
    }
)
async def create_ticket(
    user: UserDepends,
    files: list[UploadFile],
    data: Annotated[TicketDataCreate, Form()],
) -> TicketDataView:
    # Check filename
    accept_files = list(filter(
        uploadfile_checker,
        files
    ))

    # If no file
    if len(accept_files) == 0:
        raise MISSING_FILE

    # Create ticket in DB
    user = await StorageData.get(user.id)
    ticket = TicketData(
        author=user,
        files=list(map(
            lambda file: file.filename.replace("\\", "/"),
            accept_files
        )),
        **data.model_dump(exclude_unset=True)
    )

    # Save file
    ticket_id = ticket.id
    ticket_directory = join(TICKET_ROOT, ticket_id)

    # Make directory
    if not isdir(ticket_directory):
        makedirs(ticket_directory)

    # Write to file system
    tasks = list(map(
        lambda file: create_task(save_uploadfile(
            ticket_directory,
            file
        )),
        accept_files
    ))
    await gather(*tasks)

    # Write to DB
    await ticket.save()
    return ticket


@router.get(
    path="/{user_id}",
    response_model=list[TicketDataViewNoAuthor],
    description="Get the ticket list of special user",
    status_code=status.HTTP_200_OK,
    responses={
        404: {
            "description": "The user you are querying is not exist.",
            "model": generate_error_response_model(USER_NOT_FOUND)
        },
    }
)
async def user_ticket_list(
    user: UserDepends,
    user_id: str,
    offset: int = 0,
    length: int = 10,
) -> list[TicketDataViewNoAuthor]:
    # Replace self sign
    if user_id == "@me":
        user_id = user.id

    # Check permission
    only_public = user.id != user_id and not user.is_admin

    return await get_user_ticket_list(
        user_id,
        offset=offset,
        length=length,
        no_author=True,
        only_public=only_public,
    )


@router.get(
    path="/{user_id}/{ticket_id}",
    response_model=TicketDataView,
    description="Get ticket info",
    status_code=status.HTTP_200_OK,
    responses={
        404: {
            "description": "The user you are querying is not exist.",
            "model": generate_error_response_model(USER_NOT_FOUND)
        },
    }
)
async def get_ticket(
    user: UserDepends,
    user_id: str,
    ticket_id: str,
) -> TicketDataView:
    ticket = await get_ticket_with_permission(
        user,
        user_id,
        ticket_id
    )

    return ticket


@router.put(
    path="/{user_id}/{ticket_id}",
    response_model=TicketDataView,
    description="Update ticket",
    status_code=status.HTTP_201_CREATED,
    responses={
        403: {
            "descroption": "You are not the owner of this ticket.",
            "model": generate_error_response_model(PERMISSION_DENIED)
        },
        404: {
            "description": "The ticket you are querying is not exist.",
            "model": generate_error_response_model(TICKET_NOT_FOUND)
        },
    }
)
async def update_ticket(
    user: UserDepends,
    user_id: str,
    ticket_id: str,
    update: TicketDataUpdate
) -> TicketDataView:
    # Replace self sign
    if user_id == "@me":
        user_id = user.id

    # Check permission
    if user_id != user.id:
        raise PERMISSION_DENIED

    ticket = await TicketData.get(
        ticket_id,
        fetch_links=True
    )
    if ticket is None:
        raise TICKET_NOT_FOUND
    ticket = await ticket.set(
        update.model_dump(exclude_unset=True)
    )

    return ticket


@router.delete(
    path="/{user_id}/{ticket_id}",
    description="Update ticket",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        403: {
            "descroption": "You are not the owner of this ticket.",
            "model": generate_error_response_model(PERMISSION_DENIED)
        },
    }
)
async def update_ticket(
    user: UserDepends,
    user_id: str,
    ticket_id: str,
):
    # Replace self sign
    if user_id == "@me":
        user_id = user.id

    # Check permission
    if user_id != user.id:
        raise PERMISSION_DENIED

    await TicketData.find_one(
        TicketData.id == ticket_id,
        fetch_links=True
    ).delete()


@router.get(
    path="/{user_id}/{ticket_id}/files/{file_path:path}",
    response_class=FileResponse,
    description="Get ticket file content",
    status_code=status.HTTP_200_OK,
    responses={
        400: {
            "description": "The file does not exist.",
            "model": generate_error_response_model(TICKET_NOT_FOUND)
        },
        403: {
            "description": "The file path you are querying is illegal.",
            "model": generate_error_response_model(PERMISSION_DENIED)
        },
        404: {
            "description": "The ticket or user you are querying is not exist.",
            "model": generate_error_response_model(TICKET_NOT_FOUND)
        }
    }
)
async def get_ticket_file_content(
    user: UserDepends,
    user_id: str,
    ticket_id: str,
    file_path: str
) -> FileResponse:
    await get_ticket_with_permission(
        user,
        user_id,
        ticket_id
    )

    if not under_ticket_checker(file_path):
        raise PERMISSION_DENIED

    target_file = join(TICKET_ROOT, ticket_id, file_path)
    if not isfile(target_file):
        raise FILE_NOT_FOUND

    response = FileResponse(target_file)
    response.headers["Cache-Control"] = "max-age=600"
    return response


@router.get(
    path="/{user_id}/{ticket_id}/download",
    response_class=StreamingResponse,
    status_code=status.HTTP_200_OK,
    description="Download ticket zip file",
    responses={
        404: {
            "description": "The ticket or user you are querying is not exist.",
            "model": generate_error_response_model(TICKET_NOT_FOUND)
        }
    }
)
async def get_ticket_zip_files(
    user: UserDepends,
    user_id: str,
    ticket_id: str,
) -> StreamingResponse:
    await get_ticket_with_permission(
        user=user,
        user_id=user_id,
        ticket_id=ticket_id
    )

    if not isdir("temp/download-zip"):
        makedirs("temp/download-zip")

    ticket_directory = join(TICKET_ROOT, ticket_id)

    def generate_zip() -> str:
        out_filename = f"temp/download-zip/{ticket_id[:6]}"
        if isfile(f"{out_filename}.zip"):
            remove(f"{out_filename}.zip")

        zip_filename = make_archive(
            base_name=out_filename,
            format="zip",
            root_dir=ticket_directory
        )
        return zip_filename

    loop = get_event_loop()
    zip_path = await loop.run_in_executor(None, generate_zip)
    async with async_open(zip_path, "rb") as zip_file:
        zip_io = BytesIO(await zip_file.read())

    await loop.run_in_executor(None, lambda: remove(zip_path))

    response = StreamingResponse(zip_io)
    response.headers["Cache-Control"] = "max-age=600"
    return response
