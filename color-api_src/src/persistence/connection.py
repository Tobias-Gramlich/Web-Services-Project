from __future__ import annotations

import os
import time
from contextlib import contextmanager
from typing import Iterator, Optional

import mariadb


def _env(key: str, default: str) -> str:
    value = os.getenv(key)
    return default if value is None or value.strip() == "" else value


def _env_int(key: str, default: int) -> int:
    raw = os.getenv(key)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError as e:
        raise ValueError(f"Environment variable {key} must be an int, got: {raw!r}") from e


# ---- Connection pool (singleton) -------------------------------------------------

_POOL: Optional[mariadb.ConnectionPool] = None


def get_pool() -> mariadb.ConnectionPool:
    """Create (once) and return a MariaDB connection pool.

    Configure using environment variables:
      - DB_HOST (default: mariadb)
      - DB_PORT (default: 3306)
      - DB_USER (default: root)
      - DB_PASSWORD (default: my-secret-pw)
      - DB_NAME (default: colorschemes)
      - DB_POOL_SIZE (default: 5)
    """

    global _POOL
    if _POOL is not None:
        return _POOL

    # In Docker, the API container may start before MariaDB is ready.
    # Creating the pool can fail early, so we retry a few times.
    last_error: Optional[BaseException] = None
    for attempt in range(_env_int("DB_POOL_CREATE_RETRIES", 10)):
        try:
            _POOL = mariadb.ConnectionPool(
                pool_name="colorscheme_pool",
                pool_size=_env_int("DB_POOL_SIZE", 5),
                host=_env("DB_HOST", "mariadb"),
                port=_env_int("DB_PORT", 3306),
                user=_env("DB_USER", "root"),
                password=_env("DB_PASSWORD", "my-secret-pw"),
                database=_env("DB_NAME", "colorschemes"),
                autocommit=False,
            )
            break
        except mariadb.Error as e:
            last_error = e
            time.sleep(0.5 * (attempt + 1))
    else:
        raise RuntimeError("Could not create database connection pool") from last_error
    return _POOL


@contextmanager
def get_connection(*, retries: int = 10, backoff_seconds: float = 0.5) -> Iterator[mariadb.Connection]:
    """Yield a DB connection from the pool with transaction handling.

    - Commits on success
    - Rolls back on error
    - Retries on transient connection errors (useful in Docker startup)
    """

    last_error: Optional[BaseException] = None
    for attempt in range(retries):
        try:
            conn = get_pool().get_connection()
            break
        except mariadb.Error as e:
            last_error = e
            time.sleep(backoff_seconds * (attempt + 1))
    else:
        raise RuntimeError("Could not obtain database connection") from last_error

    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        # returning to pool
        conn.close()
