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


class TicketData(Document):
    id: str = Field(
        default_factory=generate_ticket_id,
    )
    author: Link[StorageData]

    files: list[str] = []
    is_public: bool = False
    remark: str = ""
    create_time: int = Field(
        default_factory=lambda: int(datetime.now().timestamp() * 1000),
    )


class TicketDataViewNoAuthor(BaseModel):
    id: str = Field(
        validation_alias=AliasChoices("id", "_id"),
        serialization_alias="id",
    )

    files: list[str]
    is_public: bool
    remark: str
    create_time: int


class TicketDataView(TicketDataViewNoAuthor):
    author: StorageDataView


class TicketDataCreate(BaseModel):
    is_public: bool = False
    remark: str = ""

    @model_validator(mode="before")
    @classmethod
    def convert_str_to_dict(cls, data):
        return loads(data)


class TicketDataUpdate(BaseModel):
    is_public: Optional[bool] = None
    remark: Optional[str] = None
