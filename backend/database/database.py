from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from config import MONGODB_URL, MONGODB_NAME
from discord_oauth import StorageData
from schemas import TicketData, SSHData

client = AsyncIOMotorClient(MONGODB_URL)

DB = client[MONGODB_NAME]

async def setup():
    await init_beanie(
        database=DB,
        document_models=[
            StorageData,
            TicketData,
            SSHData,
        ]
    )
