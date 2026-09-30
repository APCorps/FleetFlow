# Provides password hashing, JWT creation, and JWT validation for FleetFlow authentication.

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


SECRET_KEY = "fleetflow-development-secret-change-later"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# Password hashing
def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


# Password verification
def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# JWT token creation
def create_access_token(username: str) -> str:

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": username,
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# JWT authentication
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if not username:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        return username

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token"
        )