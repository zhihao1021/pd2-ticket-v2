# PD2 Ticket System v2 - Backend


[English en-US](./README.md) |
[繁體中文 zh-Hans](./README.zh_Hans.md)


## 大綱
- [解釋](#api-解釋)
    - [驗證](#驗證)
    - [Discord 驗證](#Discord-驗證)
        - [PUT `/oauth`](#-put-oauth)
        - [POST `/oauth`](#post-oauth)
    - [Ticket](#ticket)
        - [GET `/ticket`](#-get-ticket)
        - [POST `/ticket`](#-post-ticket)
        - [GET `/ticket/{user_id}`](#-get-ticketuser_id)
        - [GET `/ticket/{user_id}/{ticket_id}`](#-get-ticketuser_idticket_id)
        - [PUT `/ticket/{user_id}/{ticket_id}`](#-put-ticketuser_idticket_id)
        - [DELETE `/ticket/{user_id}/{ticket_id}`](#-delete-ticketuser_idticket_id)
        - [GET `/ticket/{user_id}/{ticket_id}/files/{file_path}`](#-get-ticketuser_idticket_idfilesfile_path)
        - [GET `/ticket/{user_id}/{ticket_id}/download`](#-get-ticketuser_idticket_iddownload)
    - [User](#使用者)
        - [GET `/user/{user_id}`](#-get-useruser_id)
    - [Info](#資訊)
        - [GET `/version`](#get-version)
        - [GET `/ping`](#get-ping)

## API 解釋

### 驗證
有著 🔒 圖示的路由代表該路由需要進行驗證。

如果要進行驗證，你需要在標頭中加入 `Authorization` 欄位，其格式為 `Authorization: <Token Type> <Token>`。

範例：
```
Authorization: Bearer eyJhbGc ... ZuOCJUPFvC4
```

如果驗證失敗，你將會收到一個狀態碼 `403` 的回應，如下面所示：

```json
{
    "detail": "Invalid authentication credentials"
}
```

### Discord 驗證
- #### 🔒 PUT `/oauth`
    - 描述：刷新 Token。
    - 請求內容：這個路由不需要任何酬載。
    - 回應內容：
        - 狀態碼：`200`
            ```json
            {
                "token_type": "Bearer",
                "access_token": "new_token"
            }
            ```
    - 錯誤回應：
        - Invalid authentication credentials
            - 描述：你的 Token 是無效的。
            - 狀態碼：`403`
        - Authorize failed
            - 描述：在與 Discord 進行驗證時失敗。
            - 狀態碼：`401`

- #### POST `/oauth`
    - 描述：將代碼與 Discord 進行驗證。
    - 請求內容：
        - 請求體：
            - `code`：在 Discord 驗證重導向後，於查詢參數 `code` 中所攜帶的代碼。
        - 範例：
            ```json
            {
                "code": "1234"
            }
            ```
    - 回應內容：
        - 狀態碼：`200`
            ```json
            {
                "token_type": "Bearer",
                "access_token": "token"
            }
            ```
    - 錯誤回應：
        - Authorize failed
            - 描述：在與 Discord 進行驗證時失敗。
            - 狀態碼：`401`


### Ticket
- #### 🔒 GET `/ticket`
    - 描述：取得你自己的 Ticket 清單。
    - 請求內容：
        - 查詢參數：
            - `offset`（選填）：清單起始位置的偏移。
            - `length`（選填）：清單的長度限制。
        - 範例：
            ```
            /ticket?offser=10&length=5
            ```
    - 回應內容：
        - 狀態碼：`200`
            ```json
            [
                {
                    "create_time": 1713837157478,
                    "files": [
                        "example.java",
                        "example.png",
                        "example.bin"
                    ],
                    "id": "371fe353525a6667b2ad",
                    "is_public": true,
                    "remark": "This is remark of ticket."
                }
            ]
            ```
    - 錯誤回應：這個路由沒有任何期望的錯誤回應。

- #### 🔒 POST `/ticket`
    - 描述：創建一個新的 Ticket。
    - 請求內容：
        - 請求體：
            - `files`：上傳檔案列表。
            - `data`：
                - `is_public`：這個 Ticket 是否為公開的。
                - `remark`：這個 Ticket 的註解。
        - 範例：
            ```js
            const formData = new FormData();
            formData.append("files", new File())
            formData.set("data", JSON.stringify({
                "is_public": true,
                "remark": "This is remark of ticket."
            }))
            ```
    - 回應內容：
        - 狀態碼：`201`
            ```json
            {
                "author": {
                    "display_data": {
                        "display_avatar": "https://cdn.discordapp.com/embed/avatars/0.png",
                        "display_name": "User",
                        "is_admin": false
                    }
                },
                "create_time": 1713837157478,
                "files": [
                    "example.java",
                    "example.png",
                    "example.bin"
                ],
                "id": "371fe353525a6667b2ad",
                "is_public": true,
                "remark": "This is remark of ticket."
            }
            ```
    - 錯誤回應：
        - File is too large
            - 描述：在上傳的檔案中，一些檔案的大小超過限制。
            - 狀態碼：`413`
        - Missing file
            - 描述：在用戶上傳的檔案中沒有任何合法的檔案。
            - 狀態碼：`400`

- #### 🔒 GET `/ticket/{user_id}`
    - 描述：取得特定使用者的 Ticket 清單。
    - 請求內容：
        - 路徑參數：
            - `user_id`：你想要查詢的使用者 ID。
        - 查詢參數：
            - `offset`（選填）：清單起始位置的偏移。
            - `length`（選填）：清單的長度限制。
        - 範例：
            ```
            /ticket/302774180611358720?offser=10&length=5
            ```
    - 回應內容：
        - 狀態碼：`200`
            ```json
            [
                {
                    "create_time": 1713837157478,
                    "files": [
                        "example.java",
                        "example.png",
                        "example.bin"
                    ],
                    "id": "371fe353525a6667b2ad",
                    "is_public": true,
                    "remark": "This is remark of ticket."
                }
            ]
            ```
    - 錯誤回應：
        - User not found
            - 描述：你正在查詢的使用者不存在。
            - 狀態碼：`404`

- #### 🔒 GET `/ticket/{user_id}/{ticket_id}`
    - 描述：透過 Ticket ID 與使用者 ID 來查詢 Ticket。
    - 請求內容：
        - 路徑參數：
            - `user_id`：你所想要查詢的 Ticket 的所有者的使用者 ID。 如果你想要查詢你自己的 Ticket，請使用 `@me`。
            - `ticket_id`：你想查詢的 Ticket 的 ID。
        - 範例：
            ```
            /ticket/@me/c39e17dde954666c8466
            ```
    - 回應內容：
        - 狀態碼：`200`
            ```json
            {
                "author": {
                    "display_data": {
                        "display_avatar": "https://cdn.discordapp.com/embed/avatars/0.png",
                        "display_name": "User",
                        "is_admin": false
                    }
                },
                "create_time": 1713837157478,
                "files": [
                    "example.java",
                    "example.png",
                    "example.bin"
                ],
                "id": "371fe353525a6667b2ad",
                "is_public": true,
                "remark": "This is remark of ticket."
            }
            ```
    - 錯誤回應：
        - Ticket not found
            - 描述：你正在查詢的 Ticket 或是使用者不存在。
            - 狀態碼：`404`

- #### 🔒 PUT `/ticket/{user_id}/{ticket_id}`
    - 描述：透過 Ticket ID 與使用者 ID 來更新 Ticket。
    - 請求內容：
        - 路徑參數：
            - `user_id`：你所想要查詢的 Ticket 的所有者的使用者 ID。 如果你想要查詢你自己的 Ticket，請使用 `@me`。
            - `ticket_id`：你想更新的 Ticket 的 ID。
        - 請求體：
            - `is_public`：這個 Ticket 是否為公開的。
            - `remark`：這個 Ticket 的註解。
        - 範例：
            ```
            /ticket/@me/c39e17dde954666c8466
            ```
            ```json
            {
                "is_public": true,
                "remark": "This is remark of ticket."
            }
            ```
    - 回應內容：
        - 狀態碼：`201`
            ```json
            {
                "author": {
                    "display_data": {
                        "display_avatar": "https://cdn.discordapp.com/embed/avatars/0.png",
                        "display_name": "User",
                        "is_admin": false
                    }
                },
                "create_time": 1713837157478,
                "files": [
                    "example.java",
                    "example.png",
                    "example.bin"
                ],
                "id": "371fe353525a6667b2ad",
                "is_public": true,
                "remark": "This is remark of ticket."
            }
            ```
    - 錯誤回應：
        - Ticket not found
            - 描述：你正在查詢的 Ticket 或是使用者不存在。
            - 狀態碼：`404`

- #### 🔒 DELETE `/ticket/{user_id}/{ticket_id}`
    - 描述：透過 Ticket ID 與使用者 ID 來刪除 Ticket。
    - 請求內容：
        - 路徑參數：
            - `user_id`：你所想要查詢的 Ticket 的所有者的使用者 ID。 如果你想要查詢你自己的 Ticket，請使用 `@me`。
            - `ticket_id`：你想刪除的 Ticket 的 ID。
        - 範例：
            ```
            /ticket/@me/c39e17dde954666c8466
            ```
    - 回應內容：
        - 狀態碼：`204`
        - 沒有內容。
    - 錯誤回應：
        - Permission denied
            - 描述：你並不是這個 Ticket 的所有者。
            - 狀態碼：`403`

- #### 🔒 GET `/ticket/{user_id}/{ticket_id}/files/{file_path}`
    - 描述：透過 Ticket 資料中的 `files` 欄位所提供的 `file_path` 來取得檔案內容。
    - 請求內容：
        - 路徑參數：
            - `user_id`：你所想要查詢的 Ticket 的所有者的使用者 ID。 如果你想要查詢你自己的 Ticket，請使用 `@me`。
            - `ticket_id`：你想查詢的 Ticket 的 ID。
            - `file_path`：在 Ticket 資料中的 `files` 欄位裡的檔案路徑。
        - 範例：
            ```
            /ticket/@me/c39e17dde954666c8466/files/example.bin
            ```
    - 回應內容：
        - 狀態碼：`200`
        - 檔案的內容。
    - 錯誤回應：
        - Ticket not found
            - 描述：你正在查詢的 Ticket 或是使用者不存在。
            - 狀態碼：`404`
        - Permission denied
            - 描述：你正在查詢的檔案路徑是不合法的。
            - 狀態碼：`403`
        - Ticket file not found
            - 描述：你查詢的檔案不存在。
            - 狀態碼：`404`

- #### 🔒 GET `/ticket/{user_id}/{ticket_id}/download`
    - 描述：取得一個包含該 Ticket 中所有檔案的壓縮檔。
    - 請求內容：
        - 路徑參數：
            - `user_id`：你所想要查詢的 Ticket 的所有者的使用者 ID。 如果你想要查詢你自己的 Ticket，請使用 `@me`。
            - `ticket_id`：你想查詢的 Ticket 的 ID。

        - 範例：
            ```
            /ticket/@me/c39e17dde954666c8466/download
            ```
    - 回應內容：
        - 狀態碼：`200`
        - 一個壓縮檔。
    - 錯誤回應：
        - Ticket not found
            - 描述：你正在查詢的 Ticket 或是使用者不存在。
            - 狀態碼：`404`


### 使用者
- #### 🔒 GET `/user/{user_id}`
    - 描述：透過使用者 ID 取得使用者資訊。
    - 請求內容：
        - 路徑參數：
            - `user_id`：你所想要查詢的使用者的 ID。 如果你想要查詢你自己的 Ticket，請使用 `@me`。
        - 範例：
            ```
            /user/@me
            ```
    - 回應內容：
        - 狀態碼：`200`
            ```json
            {
                "display_avatar": "https://cdn.discordapp.com/embed/avatars/0.png",
                "display_name": "User",
                "is_admin": false
            }
            ```
    - 錯誤回應：
        - User not found
            - 描述：你正在查詢的使用者不存在。
            - 狀態碼：`404`


### 資訊
- #### GET `/version`
    - 描述：API 當前的版本。
    - 請求內容：這個路由不需要任何酬載。
    - 回應內容：
        - 狀態碼：`200`
            ```
            v2.0.0
            ```
    - 錯誤回應：這個路由沒有任何期望的錯誤回應。

- #### GET `/ping`
    - 描述：這個路由會回傳 `pong`，用於測量延遲。
    - 請求內容：這個路由不需要任何酬載。
    - 回應內容：
        - 狀態碼：`200`
            ```
            pong
            ```
    - 錯誤回應：這個路由沒有任何期望的錯誤回應。