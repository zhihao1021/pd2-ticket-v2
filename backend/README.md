# PD2 Ticket System v2 - Backend

## Table of Content
- [API Interpretation](#api-interpretation)
    - [Authentication](#authentication)
    - [Discord OAuth](#discord-oauth)
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
    - [User](#user)
        - [GET `/user/{user_id}`](#-get-useruser_id)
    - [Info](#info)
        - [GET `/version`](#get-version)
        - [GET `/ping`](#get-ping)

## API Interpretation

### Authentication
The API route which has 🔒 icon mean that this route need authentication.

For authentication, you need to add `Authorization` field into your headers with the format `Authorization: <Token Type> <Token>`.

For example:
```
Authorization: Bearer eyJhbGc ... ZuOCJUPFvC4
```

If the token valid failed, you will receive a response with error code `403` like following:

```json
{
    "detail": "Invalid authentication credentials"
}
```

### Discord OAuth
- #### 🔒 PUT `/oauth`
    - Description: Refresh the token.
    - Request Data: This route does not need to transfer any data.
    - Response Data:
        - Status Code: `200`
            ```json
            {
                "token_type": "Bearer",
                "access_token": "new_token"
            }
            ```
    - Error Response:
        - Invalid authentication credentials
            - Description: Your JWT is not invalid.
            - Status Code: `403`
        - Authorize failed
            - Description: Valid failed when authorize the token with discord.
            - Status Code: `401`

- #### POST `/oauth`
    - Description: Authorize the code get from discord.
    - Request Data:
        - Body:
            - `code`: The code in the query parameters after discord redirect.
        - Example:
            ```json
            {
                "code": "1234"
            }
            ```
    - Response Data:
        - Status Code: `200`
            ```json
            {
                "token_type": "Bearer",
                "access_token": "token"
            }
            ```
    - Error Response:
        - Authorize failed
            - Description: Valid failed when authorize the token with discord.
            - Status Code: `401`


### Ticket
- #### 🔒 GET `/ticket`
    - Description: Get the ticket list of self.
    - Request Data:
        - Query Parameters:
            - `offset`(Optional): The offset of the list start.
            - `length`(Optional): The length limit of the list.
        - Example:
            ```
            /ticket?offser=10&length=5
            ```
    - Response Data:
        - Status Code: `200`
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
    - Error Response: This route does not have any expect error response.

- #### 🔒 POST `/ticket`
    - Description: Create a new ticket.
    - Request Data:
        - Body:
            - `files`: A list of upload files.
            - `data`:
                - `is_public`: Whether the ticket is public.
                - `remark`: The remark of the ticket will created.
        - Example:
            ```js
            const formData = new FormData();
            formData.append("files", new File())
            formData.set("data", JSON.stringify({
                "is_public": true,
                "remark": "This is remark of ticket."
            }))
            ```
    - Response Data:
        - Status Code: `201`
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
    - Error Response: 
        - File is too large
            - Description: Some file upload by user is too large.
            - Status Code: `413`
        - Missing file
            - Description: The user does not upload any file or no any legal files.
            - Status Code: `400`

- #### 🔒 GET `/ticket/{user_id}`
    - Description: Get the ticket list of target user.
    - Request Data:
        - Path Parameters:
            - `user_id`: The id of user you want to query.
        - Query Parameters:
            - `offset`(Optional): The offset of the list start.
            - `length`(Optional): The length limit of the list.
        - Example:
            ```
            /ticket/302774180611358720?offser=10&length=5
            ```
    - Response Data:
        - Status Code: `200`
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
    - Error Response:
        - User not found
            - Description: The user you are querying is not exist.
            - Status Code: `404`

- #### 🔒 GET `/ticket/{user_id}/{ticket_id}`
    - Description: Get the ticket by ticket id and user id.
    - Request Data:
        - Path Parameters:
            - `user_id`: The id of the user that the ticket you are querying belongs to. If you want to query the ticket of yourself, you can use `@me`.
            - `ticket_id`: The id of the ticket you want to query.
        - Example:
            ```
            /ticket/@me/c39e17dde954666c8466
            ```
    - Response Data:
        - Status Code: `200`
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
    - Error Response:
        - Ticket not found
            - Description: The ticket or user you are querying is not exist.
            - Status Code: `404`

- #### 🔒 PUT `/ticket/{user_id}/{ticket_id}`
    - Description: Update the ticket by ticket id and user id.
    - Request Data:
        - Path Parameters:
            - `user_id`: The id of the user that the ticket you are querying belongs to. If you want to query the ticket of yourself, you can use `@me`.
            - `ticket_id`: The id of the ticket you want to update.
        - Body:
            - `is_public`: Whether the ticket is public.
            - `remark`: The remark of the ticket.
        - Example:
            ```
            /ticket/@me/c39e17dde954666c8466
            ```
            ```json
            {
                "is_public": true,
                "remark": "This is remark of ticket."
            }
            ```
    - Response Data:
        - Status Code: `201`
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
    - Error Response:
        - Ticket not found
            - Description: The ticket or user you are querying is not exist.
            - Status Code: `404`

- #### 🔒 DELETE `/ticket/{user_id}/{ticket_id}`
    - Description: Delete the ticket by ticket id and user id.
    - Request Data:
        - Path Parameters:
            - `user_id`: The id of the user that the ticket you are querying belongs to. If you want to query the ticket of yourself, you can use `@me`.
            - `ticket_id`: The id of the ticket you want to delete.
        - Body:
            - `is_public`: Whether the ticket is public.
            - `remark`: The remark of the ticket.
        - Example:
            ```
            /ticket/@me/c39e17dde954666c8466
            ```
    - Response Data:
        - Status Code: `204`
        - No content.
    - Error Response:
        - Permission denied
            - Description: This ticket does not belong to you.
            - Status Code: `403`

- #### 🔒 GET `/ticket/{user_id}/{ticket_id}/files/{file_path}`
    - Description: Get the file content of this ticket by `file_path` in the `files` field of ticket info.
    - Request Data:
        - Path Parameters:
            - `user_id`: The id of the user that the ticket you are querying belongs to. If you want to query the ticket of yourself, you can use `@me`.
            - `ticket_id`: The id of the ticket you want to query.
            - `file_path`: The file path in the `files` field of ticket info.
        - Example:
            ```
            /ticket/@me/c39e17dde954666c8466/files/example.bin
            ```
    - Response Data:
        - Status Code: `200`
        - The content of file.
    - Error Response:
        - Ticket not found
            - Description: The ticket or user you are querying is not exist.
            - Status Code: `404`
        - Permission denied
            - Description: The file path you are querying is illegal.
            - Status Code: `403`
        - Ticket file not found
            - Description: The file does not exist.
            - Status Code: `404`

- #### 🔒 GET `/ticket/{user_id}/{ticket_id}/download`
    - Description: Get the zip file which contain all files of this ticket.
    - Request Data:
        - Path Parameters:
            - `user_id`: The id of the user that the ticket you are querying belongs to. If you want to query the ticket of yourself, you can use `@me`.
            - `ticket_id`: The id of the ticket you want to query.

        - Example:
            ```
            /ticket/@me/c39e17dde954666c8466/download
            ```
    - Response Data:
        - Status Code: `200`
        - A zip file.
    - Error Response:
        - Ticket not found
            - Description: The ticket or user you are querying is not exist.
            - Status Code: `404`


### User
- #### 🔒 GET `/user/{user_id}`
    - Description: Get the user data by user id.
    - Request Data:
        - Path Parameters:
            - `user_id`: The id of the user that you want to query. If you want to query yourself, you can use `@me`.
        - Example:
            ```
            /user/@me
            ```
    - Response Data:
        - Status Code: `200`
            ```json
            {
                "display_avatar": "https://cdn.discordapp.com/embed/avatars/0.png",
                "display_name": "User",
                "is_admin": false
            }
            ```
    - Error Response:
        - User not found
            - Description: The user you are querying is not exist.
            - Status Code: `404`


### Info
- #### GET `/version`
    - Description: The API current version.
    - Request Data: This route does not need to transfer any data.
    - Response Data:
        - Status Code: `200`
            ```
            v2.0.0
            ```
    - Error Response: This route does not have any expect error response.

- #### GET `/ping`
    - Description: This will return `pong`, used for calculate latency.
    - Request Data: This route does not need to transfer any data.
    - Response Data:
        - Status Code: `200`
            ```
            pong
            ```
    - Error Response: This route does not have any expect error response.