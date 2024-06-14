from asyncio import run

from multiprocessing import cpu_count, Pool

from api import run as run_api
from config import PORT, PROCESS_COUNT
from database.database import setup as db_setup


async def main(port: int):
    print("Start init db...")
    await db_setup()
    print("Start API...")
    await run_api(port)


def job(port: int):
    run(main=main(port))


if __name__ == "__main__":
    if PROCESS_COUNT < 2:
        run(main=main(PORT))
    else:
        with Pool(min(cpu_count(), PROCESS_COUNT)) as pool:
            pool.map(
                job,
                tuple(range(PORT, PORT + PROCESS_COUNT))
            )
