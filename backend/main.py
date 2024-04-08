from asyncio import run

from api import run as run_api
from database.database import setup as db_setup


async def main():
    print("Start init db...")
    await db_setup()
    print("Start API...")
    await run_api()

if __name__ == "__main__":
    run(main=main())
