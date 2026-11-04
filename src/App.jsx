import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./components/Header.jsx";
import { Intro as IntroComponent } from "./components/Intro.jsx";
import { FlavorCarousel as FlavorCarouselComponent } from "./components/FlavorCarousel.jsx";
import { InsideScene as InsideSceneComponent } from "./components/InsideScene.jsx";
import { FlavorRail as FlavorRailComponent } from "./components/FlavorRail.jsx";
import { PourScene as PourSceneComponent } from "./components/PourScene.jsx";
import { Questions as QuestionsComponent } from "./components/Questions.jsx";
import { NewsletterFooter as NewsletterFooterComponent } from "./components/NewsletterFooter.jsx";
import { Shop, Builder, MixTray, Basket } from "./components/Shopping.jsx";
import { useThreePack } from "./hooks/useThreePack.js";
import { useExperience } from "./hooks/useExperience.js";

// Keep the scroll/canvas scenes independent of basket and toast renders.
const Intro = memo(IntroComponent);
const FlavorCarousel = memo(FlavorCarouselComponent);
const InsideScene = memo(InsideSceneComponent);
const FlavorRail = memo(FlavorRailComponent);
const PourScene = memo(PourSceneComponent);
const Questions = memo(QuestionsComponent);
const NewsletterFooter = memo(NewsletterFooterComponent);

export default function App() {
  const effects = useRef(null);
  const dialog = useRef(null);
  const toastTimer = useRef(null);
  const [toast, setToast] = useState({ message: "", visible: false });
  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(
      () => setToast((current) => ({ ...current, visible: false })),
      3000,
    );
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const pack = useThreePack(effects);
  useExperience(effects, notify);
  function openBasket() {
    dialog.current.showModal();
    document.body.style.overflow = "hidden";
  }
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Intro />
      <Header basketCount={pack.basket.length} onOpenBasket={openBasket} />
      <main id="main">
        <FlavorCarousel />
        <InsideScene />
        <Shop pack={pack} />
        <Builder pack={pack} />
        <FlavorRail />
        <PourScene />
        <Questions />
        <NewsletterFooter />
      </main>
      <div
        id="toast"
        className={`toast${toast.visible ? " show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast.message}
      </div>
      <Basket pack={pack} dialogRef={dialog} />
      <MixTray bundle={pack.bundle} />
      <img
        className="flight-packet"
        src="assets/flamin.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        hidden
      />
    </>
  );
}
