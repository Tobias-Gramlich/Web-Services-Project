package skyjo.api;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;
import skyjo.application.DemoGameService;

@Path("/demo")
public class DemoGameResource {

    @Inject
    DemoGameService demoGameService;

    @POST
    @Path("/create")
    public Response create() {
        try {
            demoGameService.createDemoGame();
            return Response.ok("Demo game created").build();
        } catch (Exception e) {
            return Response.serverError().entity(e.getMessage()).build();
        }
    }
}