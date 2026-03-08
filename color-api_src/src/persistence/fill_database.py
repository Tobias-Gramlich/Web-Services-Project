from __future__ import annotations

import csv
from pathlib import Path

from persistence.connection import get_connection


CSV_PATH = Path(__file__).resolve().parent.parent / "ressources" / "themes.csv"


with get_connection() as conn:
    cur = conn.cursor()

    # Create table if it does not exist yet
    cur.execute("""
        CREATE TABLE IF NOT EXISTS color_palette (
            id INT AUTO_INCREMENT PRIMARY KEY,
            palette_key VARCHAR(100) NOT NULL UNIQUE,
            time_of_day VARCHAR(50) NOT NULL,
            day_type VARCHAR(50) NOT NULL,
            weather VARCHAR(50) NOT NULL,
            background VARCHAR(20) NOT NULL,
            surface VARCHAR(20) NOT NULL,
            primary_color VARCHAR(20) NOT NULL,
            secondary_color VARCHAR(20) NOT NULL
        )
    """)

    with open(CSV_PATH, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)

        data = []
        for row in reader:
            key = f"{row['time_of_day']}:{row['day_type']}:{row['weather']}"
            data.append((
                key,
                row["time_of_day"],
                row["day_type"],
                row["weather"],
                row["background"],
                row["surface"],
                row["primary"],
                row["secondary"],
            ))

    sql = """
INSERT INTO color_palette (
    palette_key,
    time_of_day,
    day_type,
    weather,
    background,
    surface,
    primary_color,
    secondary_color
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
    time_of_day = VALUES(time_of_day),
    day_type = VALUES(day_type),
    weather = VALUES(weather),
    background = VALUES(background),
    surface = VALUES(surface),
    primary_color = VALUES(primary_color),
    secondary_color = VALUES(secondary_color)
"""

    cur.executemany(sql, data)
    conn.commit()
    cur.close()