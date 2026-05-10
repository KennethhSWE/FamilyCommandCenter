package familycommandcenter.routes;

import familycommandcenter.parent.ParentPinRequest;
import familycommandcenter.parent.ParentPinService;
import io.javalin.Javalin;

import java.util.Map;

public final class ParentPinRoutes {

    private ParentPinRoutes() {
        // Utility class
    }

    public static void register(Javalin api, ParentPinService parentPinService) {

        api.post("/api/parent-pin/verify", ctx -> {
            ParentPinRequest request = ctx.bodyAsClass(ParentPinRequest.class);

            boolean verified = parentPinService.parentPinIsCorrect(request.getPin());

            if (verified) {
                ctx.status(200).json(Map.of("verified", true));
            } else {
                ctx.status(401).json(Map.of("verified", false));
            }
        });

        api.patch("/api/parent-pin/change", ctx -> {
            ParentPinRequest request = ctx.bodyAsClass(ParentPinRequest.class);

            boolean changed = parentPinService.changeParentPin(
                    request.getPin(),
                    request.getNewPin());

            if (changed) {
                ctx.status(200).json(Map.of("changed", true));
            } else {
                ctx.status(400).json(Map.of("changed", false));
            }
        });
    }
}