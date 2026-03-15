-- Make current_player_id nullable so a game can be inserted first
ALTER TABLE game
    MODIFY COLUMN current_player_id BIGINT UNSIGNED NULL;

-- Make current_game_id nullable so a player can exist before being linked to a game
ALTER TABLE player
    MODIFY COLUMN current_game_id BIGINT UNSIGNED NULL;

-- Recreate the foreign key from game.current_player_id -> player.id
ALTER TABLE game
DROP FOREIGN KEY fk_game_current_player;

ALTER TABLE game
    ADD CONSTRAINT fk_game_current_player
        FOREIGN KEY (current_player_id)
            REFERENCES player(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE;

-- Recreate the foreign key from player.current_game_id -> game.id
ALTER TABLE player
DROP FOREIGN KEY fk_player_current_game;

ALTER TABLE player
    ADD CONSTRAINT fk_player_current_game
        FOREIGN KEY (current_game_id)
            REFERENCES game(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE;
