package skyjo.api;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.OPTIONS;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

@Path("/test")
public class TestPoint {
    @OPTIONS
    public Response options() {
        return Response.ok().build();
    }
    @GET
    public String test() {
        return "ok";
    }
}