# PD2 Ticket System v2
[![Deploy](https://github.com/zhihao1021/pd2-ticket-v2/actions/workflows/auto_deploy.yml/badge.svg)](https://github.com/zhihao1021/pd2-ticket-v2/actions/workflows/auto_deploy.yml)
[![GitHub last commit](https://img.shields.io/github/last-commit/zhihao1021/pd2-ticket-v2)](https://github.com/zhihao1021/pd2-ticket-v2/commit/master)


[English en-US](./README.md) |
[繁體中文 zh-Hans](./README.zh_Hans.md)


## Introduction
A system for students in program design course to share their code with TAs.


## Requirements
```
Python >= 3.10
Node JS >= 18
```


## Deploy
### Before Start
Because the frontend part and backend part is independent, you may need some additional software(etc. Nginx, Apache) to combine it together.

In addition, the config of database(MongoDB are used in this project) is not included in this document, you will need to set up and config it yourself.


### Backend
> All operations are in the `backend` directory.
#### 0.(Optional) Create virtual environment
Create virtual environment:
```bash
python3 -m venv .venv
```

Enter virtual environment(Windows):
```bash
.\.venv\Scripts\activate
```

Enter virtual environment(MacOS/Unix):
```bash
source .venv/bin/activate
```

#### 1.Install dependency packages
```bash
pip3 install -r requirements.txt
```

#### 2.First start up
It will auto generate a new config file and exit.
```bash
python3 main.py
```

#### 3.Go to modify and complete your config file
See [Config Document](#backend-1) for more information.

#### 4.Start up
```bash
python3 main.py
```


### Frontend
> All operations are in the `frontend` directory.
#### 1.Install dependency package
```bash
npm install
```

#### 2.Modify config file
See [Config Document](#frontend-1) for more information.

#### 3.Build
```bash
npm build
```

#### 4.Deploy to your reverse proxy
Copy the `build` to your reverse proxy's path.


## Config
### Backend
Example Config:
```json
{
  "host": "0.0.0.0",
  "port": 8080,
  "worker": 1,
  "process_count": 6,
  "root_path": "",
  "key": "601d4c0a0c2ba32fe3f8d087475657a6",
  "data_dir": "data",
  "single_file_size": 1048576,
  "discord_config": {
    "redirect_uri": "https://example.com/login",
    "client_id": "0000000000",
    "client_secret": "your-client-secret",
    "admins": [
      "302774180611358720",
    ]
  },
  "mongodb_config": {
    "url": "mongodb://db_username:db_password@172.16.2.101:27017/db_table",
    "name": "table_name"
  },
  "ssh_config": {
    "host": "172.16.0.2",
    "port": 22
  }
}
```

#### Normal Config
- `host`:
    API binding address, default is `0.0.0.0`.

- `port`:
    API binding port, default is `8080`.

- `workers`
    Uvicorn workers count, default is `1`.

- `process_count`
    How many process will start, default is your cpu's cores count. (⚠ The more process start, more ports will be used, be careful about that there is no other application occpuy the port in the range. For example, you set the port `8080` and process count `6`, it will use the port in `8080~8085`.)

- `root_path`:
    FastAPI's root path, be used for Open API's document.

- `key`:
    Key for the JWT, it will auto generate when you first start up.

- `data_dir`:
    The directory path for saving the ticket file upload by user.

- `single_file_size`:
    The size limit for every file, default is `1048576`(1MB).

- `discord_config`:
    See [Discord Config Part](#discord-config-part)

- `mongodb_config`:
    See [MongoDB Config Part](#mongodb-config-part)

- `ssh_config`:
    See [SSH Config Part](#ssh-config-part)

#### Discord Config Part
- `redirect_uri`:
    The redirect uri you set in discord's developer portal.

- `client_id`:
    The client id you get in discord's developer portal.

- `client_secret`
    The client secret you get in discord's developer portal.

- `admins`:
    The list of admin's discord user id.

#### MongoDB Config Part
- `url`:
    The MongoDB's connect url.

- `name`:
    Your table's name, default is `pd2-ticket`.

#### SSH Config Part
> This feature is still develope.
- `host`:
    The SSH server's address.

- `port`:
    The SSH server's port, default is `22`.

### Frontend
Example Config:
```bash
REACT_APP_UI_VERSION=v2.0.0
REACT_APP_API_END_POINT=/api/v1
REACT_APP_OAUTH_URL=https://discord.com/oauth2/authorize?client_id=000000&response_type=code&redirect_uri=https://example.com/login&scope=identify
```

- `REACT_APP_UI_VERSION`(You doesn't need to modify this value):
    The ui version display on web.

- `REACT_APP_API_END_POINT`:
    The API's endpoint.

- `REACT_APP_OAUTH_URL`:
    The url link to discord oauth.


## Snapshots
### Ticket list page
![ticket list page](assets/Snapshot01.png)

### Ticket info page
![ticket info page](assets/Snapshot02.png)

### Code context page
![code context page](assets/Snapshot03.png)

### Upload file page
![upload file page](assets/Snapshot04.png)

### Setting page
![setting page](assets/Snapshot05.png)
