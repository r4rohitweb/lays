import { useRef, useState } from "react";
import { flavors, byId } from "../data/flavors.js";

const storageKey = "crunch-lab-basket";
function readBasket() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(stored)
      ? stored.filter((id) => byId[id]).slice(0, 99)
      : [];
  } catch {
    return [];
  }
}

export function useThreePack(effects) {
  const [state, setState] = useState(() => ({
    bundle: [],
    basket: readBasket(),
  }));
  // Also handle several programmatic clicks in a single browser task.
  const current = useRef(state);
  function commit(next) {
    const previous = current.current;
    current.current = next;
    setState(next);
    if (next.basket !== previous.basket) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next.basket));
      } catch {
        /* The concept basket still works when storage is unavailable. */
      }
    }
  }
  const notify = (message) => effects.current?.notify(message);
  const tick = () => effects.current?.tickSound();
  function addBag(id, source) {
    const { bundle, basket } = current.current;
    if (bundle.includes(id)) {
      notify("THAT FLAVOR IS ALREADY IN YOUR BOX. PICK A DIFFERENT ONE.");
      return;
    }
    if (bundle.length >= 3) {
      notify("YOUR BOX IS FULL. REMOVE A BAG TO SWAP A FLAVOR.");
      return;
    }
    commit({ basket, bundle: [...bundle, id] });
    tick();
    if (source) {
      const card = source.closest(".shop-card");
      // Wait for React to reveal the tray and render the new selection.
      effects.current?.flyToBox(card.querySelector(".card-image img"), id);
    } else
      notify(
        `${byId[id].name.toUpperCase()} — IN YOUR BOX · ${bundle.length + 1} / 3`,
      );
  }
  function removeSlot(index) {
    const { bundle, basket } = current.current;
    commit({ basket, bundle: bundle.filter((_, i) => i !== index) });
  }
  function toggleBag(id, source) {
    const index = current.current.bundle.indexOf(id);
    if (index < 0) {
      addBag(id, source);
      return;
    }
    removeSlot(index);
    tick();
    notify(`${byId[id].name.toUpperCase()} — REMOVED FROM YOUR BOX`);
  }
  function addBundle() {
    const { bundle, basket } = current.current;
    if (bundle.length !== 3) return;
    if (basket.length > 96) {
      notify("YOUR CONCEPT BASKET IS FULL. CLEAR IT TO START AGAIN.");
      return;
    }
    effects.current?.flyToBasket(bundle[0]);
    commit({ bundle: [], basket: [...basket, ...bundle] });
    notify("THREE GOOD CHOICES. ADDED TO YOUR CONCEPT BASKET.");
    tick();
  }
  function removeBasket(id) {
    const { bundle, basket } = current.current;
    const index = basket.indexOf(id);
    if (index >= 0)
      commit({ bundle, basket: basket.filter((_, i) => i !== index) });
  }
  return {
    ...state,
    addBag,
    toggleBag,
    removeSlot,
    addBundle,
    removeBasket,
    clearBasket: () => commit({ ...current.current, basket: [] }),
    basketRows: flavors
      .map((flavor) => ({
        ...flavor,
        count: state.basket.filter((id) => id === flavor.id).length,
      }))
      .filter((flavor) => flavor.count),
  };
}
