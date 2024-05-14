from pydantic import BaseModel
from orjson import dumps, loads, OPT_INDENT_2

from os import urandom
from os.path import isfile


class DiscordConfig(BaseModel):
    redirect_uri: str = ""
    client_id: str = ""
    client_secret: str = ""
    admins: list[str] = []


class MongoDBConfig(BaseModel):
    url: str = ""
    name: str = "pd2-ticket"


class SSHConfig(BaseModel):
    host: str = ""
    port: int = 22


class Config(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8080
    root_path: str = ""
    key: str = urandom(16).hex()
    data_dir: str = "data"
    single_file_size: int = 1 * 1024 * 1024
    discord_config: DiscordConfig = DiscordConfig()
    mongodb_config: MongoDBConfig = MongoDBConfig()
    ssh_config: SSHConfig = SSHConfig()


if not isfile("config.json"):
    config = Config()
    input("Please goto complete your config.......")
    exit(0)
else:
    with open("config.json", "rb") as config_file:
        config = Config(**loads(config_file.read()))

HOST = config.host
PORT = config.port
ROOT_PATH = config.root_path
KEY = config.key
DATA_DIR = config.data_dir
SINGLE_FILE_SIZE = config.single_file_size

DISCORD_REDIRECT_URI = config.discord_config.redirect_uri
DISCORD_CLIENT_ID = config.discord_config.client_id
DISCORD_CLIENT_SECRET = config.discord_config.client_secret
DISCORD_ADMINS = config.discord_config.admins

MONGODB_URL = config.mongodb_config.url
MONGODB_NAME = config.mongodb_config.name

SSH_HOST = config.ssh_config.host
SSH_PORT = config.ssh_config.port

with open("config.json", "wb") as config_file:
    config_file.write(dumps(
        config.model_dump(),
        option=OPT_INDENT_2
    ))
