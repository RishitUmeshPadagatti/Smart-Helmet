import json
import os
from pathlib import Path
from app.models import UserData

DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)


def get_user_file(user_id: str) -> Path:
    """Get the path to a user's JSON file."""
    return DATA_DIR / f"{user_id}.json"


def load_user_data(user_id: str) -> UserData:
    """Load user data from JSON file. Create default if not exists."""
    user_file = get_user_file(user_id)
    if user_file.exists():
        with open(user_file, "r") as f:
            data = json.load(f)
            return UserData(**data)
    else:
        # Return default user data
        user = UserData(rfid=user_id, name=f"User {user_id}")
        user.update_timestamp()
        save_user_data(user_id, user)
        return user


def save_user_data(user_id: str, user_data: UserData) -> None:
    """Save user data to JSON file."""
    user_file = get_user_file(user_id)
    user_data.update_timestamp()
    with open(user_file, "w") as f:
        json.dump(user_data.dict(), f, indent=2)


def list_users() -> list:
    """List all user IDs (from JSON files)."""
    return [f.stem for f in DATA_DIR.glob("*.json")]
