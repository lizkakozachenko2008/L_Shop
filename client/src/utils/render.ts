export const render = (element: HTMLElement, container: HTMLElement) => {
  container.innerHTML = "";
  container.appendChild(element);
};