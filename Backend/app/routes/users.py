from fastapi import APIRouter, HTTPException
from app.models import UserData
from app.utils import load_user_data, save_user_data, list_users

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get user data by user ID."""
    try:
        user = load_user_data(user_id)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}")
async def update_user(user_id: str, user_data: UserData):
    """Update user data by user ID."""
    try:
        save_user_data(user_id, user_data)
        return {"message": f"User {user_id} updated successfully", "user": user_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def list_all_users():
    """List all users."""
    try:
        users = list_users()
        return {"users": users, "count": len(users)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}")
async def patch_user(user_id: str, updates: dict):
    """Partially update user data."""
    try:
        user = load_user_data(user_id)
        for key, value in updates.items():
            if hasattr(user, key):
                setattr(user, key, value)
        save_user_data(user_id, user)
        return {"message": f"User {user_id} patched successfully", "user": user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
