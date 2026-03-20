package skyjo.api;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/test")
public class TestPoint {

    @GET
    public String test() {
        return "ok";
    }
}