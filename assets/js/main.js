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
