# PD2 Ticket System v2
[![Deploy](https://github.com/zhihao1021/pd2-ticket-v2/actions/workflows/auto_deploy.yml/badge.svg)](https://github.com/zhihao1021/pd2-ticket-v2/actions/workflows/auto_deploy.yml)
[![GitHub last commit](https://img.shields.io/github/last-commit/zhihao1021/pd2-ticket-v2)](https://github.com/zhihao1021/pd2-ticket-v2/commit/master)


[English en-US](./README.md) |
[繁體中文 zh-Hans](./README.zh_Hans.md)


## 介紹
提供給在程式設計課程中的助教與學生一個可以分享他們程式碼的系統。


## 需求
```
Python >= 3.10
Node JS >= 18
```


## 部署
### 開始之前
由於前端與後端是分離的，因此你可能會需要其他的軟體（如：Nginx、Apache）來將他們結合在一起。

除此之外，對於資料庫（在這個專案中使用的是 MongoDB）的設定並不包括在這份文件之中，你需要自己將其設定完成並部署。


### 後端
> 所有的步驟都在 `backend` 資料夾裡完成.
#### 0.（選用）創建虛擬環境
創建虛擬環境：
```bash
python3 -m venv .venv
```

進入虛擬環境（Windows）：
```bash
.\.venv\Scripts\activate
```

進入虛擬環境（MacOS/Unix）：
```bash
source .venv/bin/activate
```

#### 1.安裝依賴套件
```bash
pip3 install -r requirements.txt
```

#### 2.第一次啟動
在第一次啟動中，程式將自動生成設置檔並關閉。
```bash
python3 main.py
```

#### 3.更改並完善設定檔
請至 [設定](#後端-1) 以獲得更多資訊。

#### 4.啟動
```bash
python3 main.py
```


### 前端
> 所有的步驟都在 `frontend` 資料夾裡完成.
#### 1.安裝依賴套件
```bash
npm install
```

#### 2.更改設定檔
請至 [設定](#前端-1) 以獲得更多資訊。

#### 3.建置
```bash
npm build
```

#### 4.部署至你的反向代理
將 `build` 資料夾複製到你在反向代理中設定的位置。


## 設定
### 後端
範例設定檔：
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

#### 一般設定
- `host`：
    API 的監聽地址，預設是 `0.0.0.0`。

- `port`：
    API 的監聽端口，預設是 `8080`。

- `workers`
    Uvicorn 的 Worker 數量，預設是 `1`。

- `process_count`
    會啟動多少個程序，預設為你的 CPU 線程數量。（⚠ 啟動越多的程序將會占用越多的端口，請注意是否有其他程式正在占用範圍中的端口。 舉例來說，你將端口設定為 `8080`、將程序數量設定為 `6`，則整個系統將會使用範圍 `8080~8085` 的所有端口。）

- `root_path`：
    FastAPI 的 root path 設定，用於 Open API 的文件。

- `key`：
    用於 JWT 的金鑰，在第一次啟動的時候將會自動生成。

- `data_dir`：
    存放使用者上傳的檔案的資料夾。

- `single_file_size`：
    單個檔案的上傳大小限制 `1048576`（1MB）。

- `discord_config`：
    請至 [Discord 設定](#discord-設定) 以獲得更多資訊。

- `mongodb_config`：
    請至 [MongoDB 設定](#mongodb-設定) 以獲得更多資訊。

- `ssh_config`：
    請至 [SSH 設定](#ssh-設定) 以獲得更多資訊。

#### Discord 設定
- `redirect_uri`：
    你在 Discord 的開發者面板中所設定的重導向連結。

- `client_id`：
    你在 Discord 的開發者面板中所取得的 Client ID。

- `client_secret`
    你在 Discord 的開發者面板中所取得的 Client Secret。

- `admins`：
    管理員們的 Discord User ID。

#### MongoDB 設定
- `url`：
    MongoDB 的連接連結。

- `name`：
    MongoDB 的表格名稱，預設是 `pd2-ticket`。

#### SSH 設定
> 此功能仍在開發中
- `host`：
    SSH 伺服器的地址。

- `port`：
    SSH 伺服器的端口，預設是 `22`。

### 前端
範例設定檔：
```bash
REACT_APP_UI_VERSION=v2.0.0
REACT_APP_API_END_POINT=/api/v1
REACT_APP_OAUTH_URL=https://discord.com/oauth2/authorize?client_id=000000&response_type=code&redirect_uri=https://example.com/login&scope=identify
```

- `REACT_APP_UI_VERSION`（你不需要更改本項設定）：
    顯示於網頁上的使用者介面版本。

- `REACT_APP_API_END_POINT`：
    API 的接入點。

- `REACT_APP_OAUTH_URL`：
    Discord 的驗證連結。


## 快照
### Ticket 列表
![ticket 列表](assets/Snapshot01.png)

### Ticket 資訊
![ticket 資訊](assets/Snapshot02.png)

### 程式碼內容
![程式碼內容](assets/Snapshot03.png)

### 上傳檔案
![上傳檔案](assets/Snapshot04.png)

### 設定
![設定](assets/Snapshot05.png)
