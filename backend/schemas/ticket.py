from beanie import Document, Link
from orjson import loads
from pydantic import AliasChoices, BaseModel, Field, model_validator

from datetime import datetime
from os import urandom
from typing import Optional

from discord_oauth import StorageData, StorageDataView


def generate_ticket_id() -> str:
    result = urandom(6).hex()
    result += hex(int(datetime.now().timestamp()))[2:]
    return result


class TicketDataBase(BaseModel):
    """
    This is the base model, should not be return directly.
    """
    id: str = Field(
        default_factory=generate_ticket_id,
        title="TicketID",
        description="Ticket ID.",
    )
    files: list[str] = Field(
        default=[],
        title="TicketFiles",
        description="File list of this ticket.",
    )
    is_public: bool = Field(
        default=False,
        title="TicketPermission",
        description="The permission of this ticket.",
    )
    remark: str = Field(
        default="",
        title="TicketRemark",
        description="This remark of this ticket",
    )
    create_time: int = Field(
        default_factory=lambda: int(datetime.now().timestamp() * 1000),
        title="TicketCreateTime",
        description="This timestamp at ticket created.",
    )


class TicketData(TicketDataBase, Document):
    """
    This should not be return because it contains user's token.
    """
    author: Link[StorageData] = Field(
        title="TicketAuthor",
        description="The author of this ticket.",
    )


class TicketDataViewNoAuthor(TicketDataBase):
    """
    Same as TicketData, but without author field.
    This will be return when user fetch a list of tickets for lower traffic.
    """
    id: str = Field(
        validation_alias=AliasChoices("id", "_id"),
        serialization_alias="id",
        title="TicketID",
        description="Ticket ID.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "371fe353525a6667b2ad",
                    "files": [
                        "example.java",
                        "example.png",
                        "example.bin",
                    ],
                    "is_public": True,
                    "remark": "This is remark of ticket.",
                    "create_time": 1713837157478
                }
            ]
        }
    }


class TicketDataView(TicketDataBase):
    """
    Same as TicketData, but the author field only contain display data.
    This should be return when user only one ticket.
    """
    author: StorageDataView = Field(
        title="TicketAuthor",
        description="The author of this ticket but only have display_data field."
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "371fe353525a6667b2ad",
                    "files": [
                        "example.java",
                        "example.png",
                        "example.bin",
                    ],
                    "is_public": True,
                    "remark": "This is remark of ticket.",
                    "create_time": 1713837157478,
                    "author": {
                        "display_data": {
                            "is_admin": False,
                            "display_name": "User",
                            "display_avatar": "https://cdn.discordapp.com/embed/avatars/0.png",
                        },
                    },
                }
            ]
        }
    }


class TicketDataCreate(BaseModel):
    is_public: bool = Field(
        default=False,
        title="TicketPermission",
        description="The permission of this ticket.",
    )
    remark: str = Field(
        default="",
        title="TicketRemark",
        description="This remark of this ticket",
    )

    @model_validator(mode="before")
    @classmethod
    def convert_str_to_dict(cls, data):
        return loads(data)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "is_public": True,
                    "remark": "This is remark of ticket.",
                }
            ]
        }
    }


class TicketDataUpdate(BaseModel):
    is_public: Optional[bool] = Field(
        default=None,
        title="TicketPermission",
        description="The permission of this ticket.",
    )
    remark: Optional[str] = Field(
        default=None,
        title="TicketRemark",
        description="This remark of this ticket",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "is_public": True,
                    "remark": "This is remark of ticket.",
                }
            ]
        }
    }
