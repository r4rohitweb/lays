import { useLayoutEffect } from "react";
import { createScope } from "../animations/scope.js";
import { setupIntro } from "../animations/intro.js";
import { setupExperience } from "../animations/experience.js";
import { setupPour } from "../animations/pour.js";
import { setupPacketFlight } from "../animations/packetFlight.js";
import { setupFooter } from "../animations/footer.js";

export function useExperience(effects, notify) {
  useLayoutEffect(() => {
    const scope = createScope();
    try {
      const intro = setupIntro(scope);
      const interactions = setupExperience(scope, intro, notify);
      setupPour(scope);
      setupPacketFlight(scope);
      setupFooter(scope);
      effects.current = { ...interactions, notify };
    } catch (error) {
      scope.dispose();
      throw error;
    }
    return () => {
      effects.current = null;
      scope.dispose();
    };
  }, [effects, notify]);
}
