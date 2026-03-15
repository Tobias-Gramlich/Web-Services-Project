-- Create DB
CREATE DATABASE IF NOT EXISTS skyjo;
USE skyjo;

-- Player must exist before Game because Game references player(id)
CREATE TABLE IF NOT EXISTS player (
                                      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
                                      player_index INT UNSIGNED NOT NULL,
                                      playfield LONGBLOB NULL,
                                      points BIGINT UNSIGNED NOT NULL DEFAULT 0,
                                      current_game_id BIGINT UNSIGNED NULL,
                                      number_of_moves BIGINT UNSIGNED NOT NULL DEFAULT 0,
                                      last_move BOOLEAN NOT NULL DEFAULT FALSE,

                                      PRIMARY KEY (id),
                                      INDEX idx_player_current_game (current_game_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS game (
                                    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,                                    number_of_players INT UNSIGNED NOT NULL,
                                    round INT UNSIGNED NOT NULL DEFAULT 1,
                                    snapshot LONGBLOB NULL,
                                    status VARCHAR(128),
                                    current_player_id BIGINT UNSIGNED,

                                    PRIMARY KEY (id),
                                    INDEX idx_game_current_player (current_player_id)
) ENGINE=InnoDB;

-- Now that both tables exist, add the FKs
ALTER TABLE player
    ADD CONSTRAINT fk_player_current_game
        FOREIGN KEY (current_game_id) REFERENCES game(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE;

ALTER TABLE game
    ADD CONSTRAINT fk_game_current_player
        FOREIGN KEY (current_player_id) REFERENCES player(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS action (
                                      game_id BIGINT UNSIGNED NOT NULL,
                                      action_id BIGINT UNSIGNED NOT NULL,
                                      player_id BIGINT UNSIGNED NOT NULL,
                                      action_type VARCHAR(32) NOT NULL,
                                      field_before LONGTEXT NULL,
                                      field_after LONGTEXT NULL,
    card VARCHAR(128),
    newCardInField BOOLEAN NOT NULL,
    drawPile BOOLEAN NOT NULL,

                                      PRIMARY KEY (game_id, action_id),

                                      INDEX idx_action_game (game_id),
                                      INDEX idx_action_player (player_id),

                                      CONSTRAINT fk_action_game
                                          FOREIGN KEY (game_id) REFERENCES game(id)
                                              ON DELETE CASCADE
                                              ON UPDATE CASCADE,

                                      CONSTRAINT fk_action_player
                                          FOREIGN KEY (player_id) REFERENCES player(id)
                                              ON DELETE RESTRICT
                                              ON UPDATE CASCADE
) ENGINE=InnoDB;