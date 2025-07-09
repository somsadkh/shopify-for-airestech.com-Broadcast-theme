
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".main-blog__blog-button");
  const postsContainers = document.querySelectorAll(".blog-posts__container");
  const postsContainersWrapper = document.querySelector(".main-blog__blogs-posts");

  function getUrl(blogHandle, page) {
    return `/blogs/${blogHandle}?view=ajax&page=${page}`;
  }

  function fetchPosts(blogHandle, blogIndex, page) {
    postsContainersWrapper.classList.add("loading-posts");
    fetch(getUrl(blogHandle, page))
      .then(r => r.text())
      .then(html => {
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const newPosts = dom.querySelector(".blog-posts__container-more-posts");
        const newPag = dom.querySelector(".main-blog__pagination");
        const postsContainer = document.querySelector(`.blog-posts__container[data-blog-index="${blogIndex}"]`);
        const postsTarget = postsContainer.querySelector(".blog-posts__container-more-posts");
        const pagTarget = postsContainer.querySelector(".main-blog__pagination");

        if (postsTarget && newPosts) postsTarget.innerHTML = newPosts.innerHTML;
        if (pagTarget && newPag) pagTarget.innerHTML = newPag.innerHTML;

      })
      .finally(() => postsContainersWrapper.classList.remove("loading-posts"));
  }

  function initBlog(blogHandle, blogIndex, page = 1) {
    buttons.forEach(b => b.classList.remove("active"));
    document.querySelector(`.main-blog__blog-button[data-blog-index="${blogIndex}"]`).classList.add("active");
    postsContainers.forEach(c => c.classList.add("hidden"));
    const postsContainer = document.querySelector(`.blog-posts__container[data-blog-index="${blogIndex}"]`);
    postsContainer.classList.remove("hidden");
    fetchPosts(blogHandle, blogIndex, page);
  }

  // Додаємо контейнер пагінації якщо його нема (важливо для роботи AJAX)
  postsContainers.forEach(c => {
    if (!c.querySelector(".main-blog__pagination")) {
      const pag = document.createElement("div");
      pag.className = "main-blog__pagination";
      c.appendChild(pag);
    }
  });

  // Загрузка першого блогу
  const pathParts = window.location.pathname.split("/");
  const currentBlogHandle = pathParts.length >= 3 && pathParts[1] === "blogs" ? pathParts[2] : null;
  let activeButton = currentBlogHandle
    ? Array.from(buttons).find(btn => btn.getAttribute("data-blog-handle") === currentBlogHandle)
    : document.querySelector(".main-blog__blog-button");

  if (activeButton) {
    const blogHandle = activeButton.getAttribute("data-blog-handle");
    const blogIndex = activeButton.getAttribute("data-blog-index");
    initBlog(blogHandle, blogIndex, 1);
  }

  // Перемикання між блогами
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const blogHandle = button.getAttribute("data-blog-handle");
      const blogIndex = button.getAttribute("data-blog-index");
      const newUrl = `/blogs/${blogHandle}`;
      window.history.pushState({}, "", newUrl);
      initBlog(blogHandle, blogIndex, 1);
    });
  });

  // Пагінація (делегування подій)
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("pagination-link")) {
      e.preventDefault();
      const page = parseInt(e.target.dataset.page, 10);
      const postsContainer = e.target.closest('.blog-posts__container');
      const blogIndex = postsContainer.getAttribute("data-blog-index");
      const blogHandle = document.querySelector(`.main-blog__blog-button[data-blog-index="${blogIndex}"]`).getAttribute("data-blog-handle");
      fetchPosts(blogHandle, blogIndex, page);
      window.scrollTo({ top: postsContainer.offsetTop - 100, behavior: "smooth" });
    }
  });
});