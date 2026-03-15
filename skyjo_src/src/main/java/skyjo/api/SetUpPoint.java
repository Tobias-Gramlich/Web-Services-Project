package skyjo.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.jboss.logging.Logger;
import skyjo.api.dto.GameResponse;
import skyjo.api.mapper.GameResponseMapper;
import skyjo.application.GameUpsetter;
import skyjo.domain.Game;

import java.util.List;

@Path("/setUpGame")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class SetUpPoint {

    @Inject
    GameUpsetter gameUpsetter;

    private static final Logger LOG = Logger.getLogger(SetUpPoint.class);

    @POST
    public GameResponse setUpGame(List<Long> ids) throws JsonProcessingException {
        LOG.info("SetUpGame called");
        Game game = gameUpsetter.setUpGame(ids);
        return GameResponseMapper.toResponse(game);
    }
}