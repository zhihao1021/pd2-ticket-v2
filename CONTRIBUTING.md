# How to Contributing
This document will tell you how to contribute to this project.

## Backend
### Create a new router
For backend developer, if you want to add a new router which is not exist before, please create a new file under `api/routers` folder and named the file with your router's name.

After you created router, you can add it into `api/routers/__init__.py` and include it in `api/routers/api.py`.

In the `api.py`, you can use `app.include_router` to include the router to system like following:
```python
app.include_router(discord_oauth_router.router)
app.include_router(ticket_router)
app.include_router(user_router)
```

### Create a router which need user data
If you want to create a router that need data of user who create the request, you can import `UserDepends` from `api/oauth` and use it with type hint like following:
```python
@router.get("/test")
async def test(user: UserDepends):
    return f"Your display name is {user.display_name}."
```

The `UserDepends` schemas equals to `JWTData` in `discord_oauth/schemas.py`

### Create a router need authorized
If you want to create a route that only need authorized without user data, you can add `user_depends` which in `api/oauth.py` into the field `dependencies` in FastAPI's decorator like following:
```python
@router.get(
    "/test",
    dependencies=[user_depends]
)
async def test():
    return f"You have permission to access here!"
```

### Create a new model
If you need a new model that stored in DB, you can create a new file under `schemas`.
