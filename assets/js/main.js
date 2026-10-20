"use strict";
document.getElementById("year").textContent = String(new Date().getFullYear());
const header = document.querySelector(".header");
const updateHeaderHeight = () => {
  document.documentElement.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`);
};
updateHeaderHeight();
if ("ResizeObserver" in window) {
  new ResizeObserver(updateHeaderHeight).observe(header);
} else {
  window.addEventListener("resize", updateHeaderHeight);
}

const introduction = document.getElementById("titulo");
const subtitle = document.querySelector(".hero-copy .intro");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (introduction && !reducedMotion.matches) {
  introduction.setAttribute("aria-label", introduction.innerText.replace(/\s+/g, " ").trim());
  for (const line of introduction.children) line.setAttribute("aria-hidden", "true");
  const textNodes = [];
  if (subtitle) {
    const accessibleText = document.createElement("span");
    accessibleText.textContent = subtitle.innerText.replace(/\s+/g, " ").trim();
    accessibleText.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
    const visualText = document.createElement("span");
    visualText.setAttribute("aria-hidden", "true");
    visualText.append(...subtitle.childNodes);
    subtitle.append(accessibleText, visualText);
  }
  const animatedParts = [introduction, subtitle?.lastElementChild].filter(Boolean);
  for (const part of animatedParts) {
    const walker = document.createTreeWalker(part, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) textNodes.push(walker.currentNode);
  }
  const characters = [];
  for (const node of textNodes) {
    const fragment = document.createDocumentFragment();
    for (const letter of Array.from(node.textContent)) {
      const character = document.createElement("span");
      character.textContent = letter;
      character.style.visibility = "hidden";
      fragment.append(character);
      characters.push(character);
    }
    node.replaceWith(fragment);
  }
  let position = 0;
  let timer;
  const finish = () => {
    clearTimeout(timer);
    for (const character of characters) character.style.visibility = "visible";
    introduction.dataset.typingComplete = "true";
    reducedMotion.removeEventListener("change", onMotionChange);
  };
  const onMotionChange = event => { if (event.matches) finish(); };
  reducedMotion.addEventListener("change", onMotionChange);
  const typeNext = () => {
    characters[position].style.visibility = "visible";
    position += 1;
    if (position < characters.length) {
      timer = setTimeout(typeNext, 65);
    } else {
      finish();
    }
  };
  timer = setTimeout(typeNext, 250);
}
