"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { cartLineKey, resolvePromotion, selectTotals, totalQuantity } from "@/components/cart/cartPricing";

const STORAGE_KEY = "mabco-cart-v1";

const CartContext = createContext(null);

/** @typedef {{ key: string, productId: string, title: string, image: string, price: number, quantity: number, options: { storage?: string, color?: string }, stock: string, detailHref?: string, meta?: string }} CartLine */

const initialState = {
  /** @type {CartLine[]} */
  lines: [],
  /** @type {CartLine[]} */
  wishlist: [],
  /** @type {string|null} */
  promoCode: null,
  /** False until persisted state has been read on the client. */
  hydrated: false,
};

const MAX_PER_LINE = 10;

const clampQuantity = (value) => Math.min(MAX_PER_LINE, Math.max(1, Math.trunc(value) || 1));

/**
 * All cart mutations funnel through this reducer, so two rapid quantity clicks
 * apply to the freshest state instead of racing each other.
 */
function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };

    case "ADD": {
      const line = action.payload;
      const existing = state.lines.find((l) => l.key === line.key);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.key === line.key ? { ...l, quantity: clampQuantity(l.quantity + line.quantity) } : l
          ),
        };
      }
      return { ...state, lines: [...state.lines, { ...line, quantity: clampQuantity(line.quantity) }] };
    }

    case "SET_QUANTITY":
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.key === action.key ? { ...l, quantity: clampQuantity(action.quantity) } : l
        ),
      };

    case "REMOVE":
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };

    /** Undo: puts the line back where it was so the list does not reshuffle. */
    case "RESTORE": {
      if (state.lines.some((l) => l.key === action.line.key)) return state;
      const lines = [...state.lines];
      lines.splice(Math.min(action.index, lines.length), 0, action.line);
      return { ...state, lines };
    }

    case "CLEAR":
      return { ...state, lines: [], promoCode: null };

    case "MOVE_TO_WISHLIST": {
      const line = state.lines.find((l) => l.key === action.key);
      if (!line) return state;
      const alreadySaved = state.wishlist.some((w) => w.key === line.key);
      return {
        ...state,
        lines: state.lines.filter((l) => l.key !== action.key),
        wishlist: alreadySaved ? state.wishlist : [...state.wishlist, { ...line, quantity: 1 }],
      };
    }

    case "WISHLIST_REMOVE":
      return { ...state, wishlist: state.wishlist.filter((w) => w.key !== action.key) };

    case "PROMO_SET":
      return { ...state, promoCode: action.code };

    case "PROMO_CLEAR":
      return { ...state, promoCode: null };

    default:
      return state;
  }
}

const readPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      promoCode: typeof parsed.promoCode === "string" ? parsed.promoCode : null,
    };
  } catch {
    return null;
  }
};

/**
 * Canonical cart + wishlist state.
 *
 * The drawer, the cart page, the header badge and the product pages all read
 * from here — there is no second copy of cart data anywhere. Drawer open/closed
 * lives here too, so the header button and the drawer stay in step without
 * prop-drilling through the layout.
 */
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const hydratedRef = useRef(false);

  // Read persisted state after mount. Doing this during render would make the
  // server markup and the first client paint disagree; until it completes the
  // consumers render skeletons rather than a wrong "empty cart".
  useEffect(() => {
    if (hydratedRef.current) return undefined;
    hydratedRef.current = true;

    const raf = requestAnimationFrame(() => {
      dispatch({ type: "HYDRATE", payload: readPersisted() ?? {} });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Persist after every change (never before hydration, or we would overwrite
  // the stored cart with the empty initial state).
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lines: state.lines, wishlist: state.wishlist, promoCode: state.promoCode })
      );
    } catch {
      // Storage may be unavailable (private mode, quota) — cart still works.
    }
  }, [state.hydrated, state.lines, state.wishlist, state.promoCode]);

  // Keep other tabs in sync.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      dispatch({ type: "HYDRATE", payload: readPersisted() ?? { lines: [], wishlist: [], promoCode: null } });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const openCart = useCallback(() => setDrawerOpen(true), []);
  const closeCart = useCallback(() => setDrawerOpen(false), []);

  const addItem = useCallback((product, { quantity = 1, options = {} } = {}) => {
    dispatch({
      type: "ADD",
      payload: {
        key: cartLineKey(product.id, options),
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity,
        options,
        stock: product.stock ?? "in",
        detailHref: product.detailHref,
        meta: product.meta,
      },
    });
  }, []);

  const setQuantity = useCallback((key, quantity) => {
    dispatch({ type: "SET_QUANTITY", key, quantity });
  }, []);

  /** Removes a line and returns what is needed to put it back. */
  const removeLine = useCallback(
    (key) => {
      const index = state.lines.findIndex((l) => l.key === key);
      const line = state.lines[index];
      dispatch({ type: "REMOVE", key });
      return line ? { line, index } : null;
    },
    [state.lines]
  );

  const restoreLine = useCallback((line, index) => {
    dispatch({ type: "RESTORE", line, index });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const moveToWishlist = useCallback((key) => dispatch({ type: "MOVE_TO_WISHLIST", key }), []);

  const removeFromWishlist = useCallback((key) => dispatch({ type: "WISHLIST_REMOVE", key }), []);

  /**
   * Validate then store a promo code. Returns the resolution so the form can
   * show a precise message instead of a generic failure.
   */
  const applyPromo = useCallback(
    (code) => {
      const subtotal = state.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
      const result = resolvePromotion(code, subtotal);
      if (result.ok) dispatch({ type: "PROMO_SET", code: result.code });
      return result;
    },
    [state.lines]
  );

  const removePromo = useCallback(() => dispatch({ type: "PROMO_CLEAR" }), []);

  const totals = useMemo(() => selectTotals(state.lines, state.promoCode), [state.lines, state.promoCode]);

  const count = useMemo(() => totalQuantity(state.lines), [state.lines]);

  const value = useMemo(
    () => ({
      lines: state.lines,
      wishlist: state.wishlist,
      promoCode: state.promoCode,
      hydrated: state.hydrated,
      totals,
      count,
      isDrawerOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeLine,
      restoreLine,
      clearCart,
      moveToWishlist,
      removeFromWishlist,
      applyPromo,
      removePromo,
    }),
    [
      state.lines,
      state.wishlist,
      state.promoCode,
      state.hydrated,
      totals,
      count,
      isDrawerOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeLine,
      restoreLine,
      clearCart,
      moveToWishlist,
      removeFromWishlist,
      applyPromo,
      removePromo,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access cart state and actions. */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
