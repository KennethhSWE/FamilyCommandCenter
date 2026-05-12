package familycommandcenter.routes;

import familycommandcenter.parent.ParentPinRequest;
import familycommandcenter.parent.ParentPinService;
import familycommandcenter.util.AuthContext;
import io.javalin.Javalin;

import java.util.Map;
import java.util.UUID;

public final class ParentPinRoutes {

    private ParentPinRoutes() {
        // Utility class
    }

    public static void register(Javalin api, ParentPinService parentPinService) {

        api.post("/api/parent-pin/verify", ctx -> {
            UUID householdId = AuthContext.requireHouseholdId(ctx);

            /*
             * Keeps the old behavior where a new household can start with 1234
             * until the parent changes it.
             */
            parentPinService.makeSureStarterPinExists(householdId);

            ParentPinRequest request = ctx.bodyAsClass(ParentPinRequest.class);

            boolean verified = parentPinService.parentPinIsCorrect(
                    request.getPin(),
                    householdId);

            if (verified) {
                ctx.status(200).json(Map.of("verified", true));
            } else {
                ctx.status(401).json(Map.of("verified", false));
            }
        });

        api.patch("/api/parent-pin/setup", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ParentPinRequest request = ctx.bodyAsClass(ParentPinRequest.class);

            boolean changed = parentPinService.setParentPinDuringSetup(
                    request.getNewPin(),
                    householdId);

            if (changed) {
                ctx.status(200).json(Map.of("changed", true));
            } else {
                ctx.status(400).json(Map.of("changed", false));
            }
        });

        api.patch("/api/parent-pin/change", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            /*
             * Keeps the old default 1234 behavior available for a household
             * that has not changed the PIN yet.
             */
            parentPinService.makeSureStarterPinExists(householdId);

            ParentPinRequest request = ctx.bodyAsClass(ParentPinRequest.class);

            boolean changed = parentPinService.changeParentPin(
                    request.getPin(),
                    request.getNewPin(),
                    householdId);

            if (changed) {
                ctx.status(200).json(Map.of("changed", true));
            } else {
                ctx.status(400).json(Map.of("changed", false));
            }
        });
    }
}