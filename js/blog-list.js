(() => {
  const cms = window.SkyCastBDCms;
  const grid = document.getElementById('blogGrid');

  if (!cms || !grid) return;

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');

  const stripHtml = (value = '') => String(value).replace(/<[^>]+>/g, '').trim();
  const formatDate = (value) => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));

  const renderFallback = () => {
    grid.innerHTML = `
      <article class="blog-card">
        <h2>CMS blog posts are loading soon</h2>
        <p class="blog-meta">SkyCastBD Editorial Team</p>
        <p>Published CMS articles will appear here automatically after they are created from the admin panel.</p>
      </article>
    `;
  };

  const renderPosts = (posts) => {
    if (!posts.length) {
      renderFallback();
      return;
    }

    grid.innerHTML = posts.map((post) => {
      const description = post.seo?.metaDescription || stripHtml(post.content).slice(0, 150);
      return `
        <article class="blog-card" itemscope itemtype="https://schema.org/BlogPosting">
          ${post.featuredImage ? `<img class="blog-card-image" src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(post.title)}" loading="lazy" decoding="async">` : ''}
          <h2 itemprop="headline">${escapeHtml(post.title)}</h2>
          <p class="blog-meta"><time datetime="${escapeHtml(post.date)}" itemprop="datePublished">${escapeHtml(formatDate(post.date))}</time> · SkyCastBD</p>
          <p itemprop="description">${escapeHtml(description)}</p>
          <a class="blog-card-link" itemprop="url" href="post.html?slug=${encodeURIComponent(post.slug)}">Read article →</a>
        </article>
      `;
    }).join('');
  };

  cms.listBlogs({ limit: 30 })
    .then(renderPosts)
    .catch(() => renderFallback());
})();
