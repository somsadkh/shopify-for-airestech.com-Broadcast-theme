document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".main-blog__blog-button");
  const postsContainersWrapper = document.querySelector(".main-blog__blogs-posts");
  const postsContainers = document.querySelectorAll(".blog-posts__container");
  const storefrontToken = "ca30073b75722fc45956606248ff7823";
  const shopifyDomain = "airestech.myshopify.com";

  function loadBlogPosts(blogHandle, blogIndex, cursor = null, append = false) {
    postsContainersWrapper.classList.add("loading-posts");
    
    const query = `
    query {
      blog(handle: "${blogHandle}") {
        articles(first: 4, after: ${
          cursor ? `"${cursor}"` : "null"
        }, reverse: true) {
          edges {
            node {
              title
              handle
              excerpt(truncateAt: 213)
              id
              image {
              url
              }
              onlineStoreUrl
              tags
              metafield(namespace: "custom", key: "tags"){
                value
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

    fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontToken,
      },
      body: JSON.stringify({ query }),
    })
      .then((response) => response.json())
      .then((data) => {
        const postsContainer = document.querySelector(
          `.blog-posts__container[data-blog-index="${blogIndex}"]`
        );
        const initialContainerLeft = postsContainer.querySelector(
          ".blog-posts__container-initial-left"
        );
        const initialContainerRight = postsContainer.querySelector(
          ".blog-posts__container-initial-right"
        );
        const morePostsContainer = postsContainer.querySelector(
          ".blog-posts__container-more-posts"
        );
        const articles = data.data.blog.articles.edges;

        if (!append) {
          initialContainerLeft.innerHTML = "";
          initialContainerRight.innerHTML = "";
          morePostsContainer.innerHTML = "";
        }

        if (!append) {
          articles.slice(0, 1).forEach((article) => {
            const imageUrl = article.node.image ? article.node.image.url : null;
            let tags = []
            if(article.node.metafield){
              const str = article.node.metafield.value;
              tags = JSON.parse(str);
            }
            //const tags = article.node.tags || [];
            const tagsHTML =
              tags.length > 0
                ? tags
                    .map(
                      (tag) =>
                        `<div class="main-blog__post-tag"><span class="tag">${tag}</span></div>`
                    )
                    .join(" ")
                : "";
            initialContainerLeft.innerHTML += `
      <div class="main-blog__post">
        <div class="main-blog__post-image">
        <a href="${article.node.onlineStoreUrl}">
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${article.node.title}" />`
              : ""
          }
          </a>
        </div>
        <div class="main-blog__post-info">
        <div class="main-blog__post-tags x">${tagsHTML}</div>
          <a class="main-blog__post-title" href="${article.node.onlineStoreUrl}">${article.node.title}</a>
          <p>${article.node.excerpt}</p>
          <a href="${article.node.onlineStoreUrl}">Read more</a>
        </div>
      </div>
    `;
          });

          articles.slice(1, 4).forEach((article) => {
            const imageUrl = article.node.image ? article.node.image.url : null;
            let tags = []
            if(article.node.metafield){
              const str = article.node.metafield.value;
              tags = JSON.parse(str);
            }
            //const tags = article.node.tags || [];
            const tagsHTML =
              tags.length > 0
                ? tags
                    .map(
                      (tag) =>
                        `<div class="main-blog__post-tag"><span class="tag">${tag}</span></div>`
                    )
                    .join(" ")
                : "";
            initialContainerRight.innerHTML += `
      <div class="main-blog__post">
       <div class="main-blog__post-image">
       <a class="main-blog__post-title" href="${article.node.onlineStoreUrl}">
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${article.node.title}" />`
              : ""
          }
          </a>
        </div>
        <div class="main-blog__post-info">
        <div class="main-blog__post-tags y">${tagsHTML}</div>
          <a class="main-blog__post-title" href="${article.node.onlineStoreUrl}">${article.node.title}</a>
          <p>${article.node.excerpt}</p>
          <a href="${article.node.onlineStoreUrl}">Read more</a>
        </div>
      </div>
    `;
          });
        }

        if (append) {
          articles.forEach((article) => {
            const imageUrl = article.node.image ? article.node.image.url : null;
            let tags = []
            if(article.node.metafield){
              const str = article.node.metafield.value;
              tags = JSON.parse(str);
            }
            //const tags = article.node.tags || [];
            const tagsHTML =
              tags.length > 0
                ? tags
                    .map(
                      (tag) =>
                        `<div class="main-blog__post-tag"><span class="tag">${tag}</span></div>`
                    )
                    .join(" ")
                : "";
            morePostsContainer.innerHTML += `
      <div class="main-blog__post">
       <div class="main-blog__post-image">
       <a class="main-blog__post-title" href="${article.node.onlineStoreUrl}">
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${article.node.title}" />`
              : ""
          }
          </a>
        </div>
        <div class="main-blog__post-info">
        <div class="main-blog__post-tags z">${tagsHTML}</div>
          <a class="main-blog__post-title" href="${article.node.onlineStoreUrl}">${article.node.title}</a>
          <p>${article.node.excerpt}</p>
          <a href="${article.node.onlineStoreUrl}">Read more</a>
        </div>
      </div>
    `;
          });
        }

        const loadMoreButton = postsContainer.querySelector(".load-more");

        if (data.data.blog.articles.pageInfo.hasNextPage) {
          if (!loadMoreButton) {
            postsContainer.innerHTML += `
            <button class="load-more" data-blog-handle="${blogHandle}" data-blog-index="${blogIndex}" data-cursor="${data.data.blog.articles.pageInfo.endCursor}">
              Load more
            </button>
          `;
          } else {
            loadMoreButton.setAttribute(
              "data-cursor",
              data.data.blog.articles.pageInfo.endCursor
            );
          }
        } else {
          if (loadMoreButton) {
            loadMoreButton.remove();
          }
        }
      })
    .catch((error) => console.error("Error loading posts:", error))
    .finally(() => {
      postsContainersWrapper.classList.remove("loading-posts"); 
    });
  }

const pathParts = window.location.pathname.split("/");
const currentBlogHandle = pathParts.length >= 3 && pathParts[1] === "blogs" ? pathParts[2] : null;

let activeButton = null;

if (currentBlogHandle) {
  activeButton = Array.from(buttons).find(
    (button) => button.getAttribute("data-blog-handle") === currentBlogHandle
  );
}

  if (!activeButton) {
  activeButton = document.querySelector(".main-blog__blog-button");
}

  if (activeButton) {
  buttons.forEach((btn) => btn.classList.remove("active"));
  activeButton.classList.add("active");

  postsContainers.forEach((container) => container.classList.add("hidden"));
  const blogIndex = activeButton.getAttribute("data-blog-index");
  document
    .querySelector(`.blog-posts__container[data-blog-index="${blogIndex}"]`)
    .classList.remove("hidden");

  const blogHandle = activeButton.getAttribute("data-blog-handle");
  loadBlogPosts(blogHandle, blogIndex);
}

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      postsContainers.forEach((container) => container.classList.add("hidden"));
      const blogIndex = button.getAttribute("data-blog-index");
      document
        .querySelector(`.blog-posts__container[data-blog-index="${blogIndex}"]`)
        .classList.remove("hidden");
      
      const blogHandle = button.getAttribute("data-blog-handle");
      const newUrl = `/blogs/${blogHandle}`;
      window.history.pushState({}, "", newUrl);
      
      loadBlogPosts(button.getAttribute("data-blog-handle"), blogIndex);
    });
  });

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("load-more")) {
      const blogHandle = event.target.getAttribute("data-blog-handle");
      const blogIndex = event.target.getAttribute("data-blog-index");
      const cursor = event.target.getAttribute("data-cursor");
      loadBlogPosts(blogHandle, blogIndex, cursor, true);
    }
  });

  //search results
  const searchInput = document.getElementById("search-posts-input");
const resultsContainer = document.getElementById("search-posts-results");

searchInput.addEventListener("input", function () {
  const query = searchInput.value.trim();

  if (!query) {
    resultsContainer.style.display = "none";
    resultsContainer.innerHTML = "";
    return;
  }

  resultsContainer.style.display = "block";
  resultsContainer.innerHTML = "<div class='search-preloader'><p>Loading...</p></div>";

  fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=article&resources[options][fields]=title,tag&resources[limit]=4`)
    .then((response) => response.json())
    .then((data) => {
      const articles = data.resources.results.articles;

      if (articles.length === 0) {
        resultsContainer.innerHTML = "<div class='no-results'><p><strong>Sorry, there are no articles here.</strong></p></div>";
        return;
      }

      const html = articles
        .map((article, index) => {
          const imageUrl = article.image 
            ? article.image
            : 'https://cdn.shopify.com/s/files/1/0000/0001/articles/default.jpg'; // запасне зображення

          return `
            <div class="grid-item text-left" id="item--search-${index}" data-grid-item="">
              <div class="search-results-item__image" data-product-image="" role="option" aria-selected="false">
                <a class="item-link" href="${article.url}" aria-label="${article.title}">
                  <div class="search-results-item__bg aos-animate" data-aos="img-in" data-aos-delay="0" data-aos-duration="800" data-aos-anchor="#item--search-${index}" data-aos-easing="ease-out-quart">
                    <figure class="image-wrapper image-wrapper--cover lazy-image lazy-image--backfill" style="--aspect-ratio: ${article.image_aspect_ratio || 1.5};">
                      <img 
                        src="${imageUrl}&width=500" 
                        alt="${article.image_alt || article.title}" 
                        loading="eager"
                        width="800"
                        height="600"
                        sizes="(min-width: 1400px) calc(25vw - 16px), (min-width: 750px) calc(33vw - 16px), (min-width: 480px) calc(50vw - 16px), calc(100vw - 32px)"
                      />
                    </figure>
                  </div>
                </a>
              </div>

              <div class="item-information aos-animate" data-aos="fade" data-aos-delay="0" data-aos-duration="800" data-aos-anchor="#item--search-${index}">
                <a class="item-link" href="${article.url}">
                  ${article.title}
                </a>
              </div>
            </div>
          `;
        })
        .join("");

      resultsContainer.innerHTML = `<div class="grid-outer"><div class="grid" id="SearchLoop">${html}</div></div>`;
    })
    .catch((error) => {
      console.error("Error:", error);
      resultsContainer.style.display = "none";
      resultsContainer.innerHTML = "";
    });
});

  

  document.addEventListener("click", function (event) {
    if (
      !resultsContainer.contains(event.target) &&
      event.target !== searchInput
    ) {
      resultsContainer.style.display = "none";
    }
  });
});
