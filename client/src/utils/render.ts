/**
 * Рендерит HTML элемент в указанный контейнер
 * @param {HTMLElement} element - Элемент, который нужно отрендерить
 * @param {HTMLElement} container - Контейнер, в который будет помещён элемент
 * @returns {void}
 * 
 * @example
 * // Пример использования:
 * const header = new HeaderComponent();
 * const headerElement = await header.render();
 * render(headerElement, document.getElementById('root')!);
 * 
 * @example
 * // Очистка и рендер новой страницы:
 * const page = CartPage();
 * render(page, document.querySelector('#app')!);
 */
export const render = (element: HTMLElement, container: HTMLElement) => {
  container.innerHTML = "";
  container.appendChild(element);
};