package skyjo.infrastructure.persistence.dto;


public record ActionRow (Long action_id, Long game_id, boolean drawn_card, boolean revealed_card) {}
