let styleEl = null;

function hexToRgba(hex, alpha) {
  const DEFAULT_HEX = "#FFC800";

  if (typeof hex !== "string") {
    hex = DEFAULT_HEX;
  }

  let value = hex.trim();
  if (value.startsWith("#")) {
    value = value.slice(1);
  }

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    value = DEFAULT_HEX.slice(1);
  }

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function initStyles(
  textColor = "#000000",
  bgColor = "#FFC800",
  opacity = 100,
  borderColor = "#FF0000",
) {
  const opacityDecimal = opacity / 100;
  const hoverOpacity = Math.min(opacityDecimal + 0.25, 1);
  const bgRgba = hexToRgba(bgColor, opacityDecimal);
  const bgHoverRgba = hexToRgba(bgColor, hoverOpacity);

  if (styleEl) styleEl.remove();
  styleEl = document.createElement("style");
  styleEl.textContent = `
        body .highlight-ads-bg {
            background-color: ${bgRgba} !important;
            color: ${textColor} !important;
            padding: 0.5rem !important;
            border-radius: 0.3rem !important;
            border: 1px solid !important;
            margin-bottom: 2rem;
            transition: background-color 300ms ease !important;
        }
        body .highlight-ads-bg:hover {
            background-color: ${bgHoverRgba} !important;
        }
        body .highlight-ads-bg * {
            color: ${textColor} !important;
            background: initial;
        }
        body .highlight-ads-border {
            border: 3px solid ${borderColor} !important;
            border-radius: 0.3rem !important;
            padding: 0.5rem !important;
            margin-bottom: 0.5rem !important;
            box-sizing: border-box !important;
        }
    `;
  document.head.append(styleEl);
}

function hasParentWithClass(element, className) {
  let el = element.parentElement;
  while (el) {
    if (el.classList?.contains(className)) return true;
    el = el.parentElement;
  }
  return false;
}

function getVisibleChildren(el) {
  const HIDDEN_TAGS = new Set([
    "SCRIPT",
    "STYLE",
    "TEMPLATE",
    "LINK",
    "META",
    "BR",
    "HR",
  ]);
  return Array.from(el.children).filter((c) => !HIDDEN_TAGS.has(c.tagName));
}

function findIndividualAds(container) {
  const selectors = "[data-text-ad], .uEierd, .mnr-c";
  let ads = container.querySelectorAll(selectors);
  if (ads.length > 1) return ads;

  let el = container;
  let bestSiblings = null;
  const maxDepth = 12;

  for (let i = 0; i < maxDepth; i++) {
    const children = getVisibleChildren(el);

    if (children.length > 1) {
      bestSiblings = children;
      // Only dig deeper if exactly one child has multiple visible children --
      // that child is likely the ad list wrapper. If most children have
      // multiple children, we're at the individual ad level -- stop.
      const withMultiple = children.filter(
        (c) => getVisibleChildren(c).length > 1,
      );
      if (withMultiple.length === 1) {
        el = withMultiple[0];
        continue;
      }
      break;
    }
    if (children.length === 0) break;
    el = children[0];
  }

  return bestSiblings || [];
}

function highlightAds() {
  chrome.storage.sync.get(
    [
      "textColorLight",
      "bgColorLight",
      "opacityLight",
      "highlightModeLight",
      "borderColorLight",
      "textColorDark",
      "bgColorDark",
      "opacityDark",
      "highlightModeDark",
      "borderColorDark",
    ],
    (result) => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      let textColor, bgColor, opacity, mode, borderColor;
      if (prefersDark) {
        textColor = result.textColorDark || "#FFC800";
        bgColor = result.bgColorDark || "#000000";
        opacity = result.opacityDark !== undefined ? result.opacityDark : 100;
        mode = result.highlightModeDark || "both";
        borderColor = result.borderColorDark || "#FF0000";
      } else {
        textColor = result.textColorLight || "#000000";
        bgColor = result.bgColorLight || "#FFC800";
        opacity = result.opacityLight !== undefined ? result.opacityLight : 100;
        mode = result.highlightModeLight || "both";
        borderColor = result.borderColorLight || "#FF0000";
      }

      initStyles(textColor, bgColor, opacity, borderColor);

      const showBg = mode === "background" || mode === "both";
      const showBorder = mode === "border" || mode === "both";

      // Ad block containers (top ads, product carousel, bottom ads)
      const tvcap = document.getElementById("tvcap");
      const atvcap = document.querySelector('[data-st-tgt="atvcap"]');
      const bottomads = document.getElementById("bottomads");
      const containers = [tvcap, atvcap, bottomads];

      // Individual ad wrappers (middle/top/bottom ads)
      const adsWrapper = document.querySelectorAll(
        '[jscontroller="tY2w9d"][class="vbIt3d"]',
      );

      // Right-hand side product/shopping ads
      const complementaryAds = document.querySelectorAll(
        ".commercial-unit-desktop-rhs",
      );

      setTimeout(() => {
        // Clear any previous highlights before applying new ones
        document
          .querySelectorAll(".highlight-ads-bg, .highlight-ads-border")
          .forEach((el) => {
            el.classList.remove("highlight-ads-bg", "highlight-ads-border");
          });

        function applyBorderToRegion(region) {
          const individualAds = findIndividualAds(region);
          if (individualAds.length > 1) {
            Array.from(individualAds).forEach((ad) => {
              if (
                !ad.classList.contains("highlight-ads-border") &&
                !hasParentWithClass(ad, "highlight-ads-border")
              ) {
                ad.classList.add("highlight-ads-border");
              }
            });
          } else {
            region.classList.add("highlight-ads-border");
          }
        }

        // Highlight ad block containers (top ads, product carousel, bottom ads)
        containers.forEach((container) => {
          if (!container) return;
          const firstChild = container.querySelector(":scope > *");
          if (!firstChild || firstChild.clientHeight <= 1) return;

          if (showBg) container.classList.add("highlight-ads-bg");
          if (showBorder) applyBorderToRegion(container);
        });

        // Highlight individual ad wrappers (middle/inline ads)
        adsWrapper.forEach((region) => {
          if (
            hasParentWithClass(region, "highlight-ads-bg") ||
            hasParentWithClass(region, "highlight-ads-border")
          )
            return;
          if (showBg) region.classList.add("highlight-ads-bg");
          if (showBorder) applyBorderToRegion(region);
        });

        // Highlight right-hand side complementary ads
        complementaryAds.forEach((region) => {
          if (
            hasParentWithClass(region, "highlight-ads-bg") ||
            hasParentWithClass(region, "highlight-ads-border")
          )
            return;
          if (showBg) region.classList.add("highlight-ads-bg");
          if (showBorder) applyBorderToRegion(region);
        });
      }, 1);
    },
  );
}

// Run on initial load
highlightAds();

// Re-run when Google does SPA navigation (URL changes without full page reload)
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(highlightAds, 300);
  }
});

function startObserver() {
  if (!document.body) return;
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.body) {
  startObserver();
} else {
  window.addEventListener("DOMContentLoaded", startObserver, { once: true });
}
