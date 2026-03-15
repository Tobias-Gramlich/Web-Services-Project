package skyjo.infrastructure.persistence.mapper;

import infrastructure.jooq.generated.tables.records.ActionRecord;
import infrastructure.jooq.generated.tables.records.GameRecord;
import infrastructure.jooq.generated.tables.records.PlayerRecord;
import skyjo.domain.*;

public interface IGameMapper {
    public Action toDomain(ActionRecord a);
    public PlayField toDomain(String playfieldJSon);
    public Card toDomainCard(String cardJson);
    public Player toDomainPlayer(PlayerRecord p);
    public Game toDomainGame(GameRecord g);


}
