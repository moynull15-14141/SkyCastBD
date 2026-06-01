(() => {
  const cms = window.SkyCastBDCms;
  const article = document.getElementById('blogPost');

  if (!cms || !article) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '\u0026amp;')
    .replace(/</g, '\u0026lt;')
    .replace(/>/g, '\u0026gt;')
    .replace(/"/g, '\u0026quot;')
    .replace(/'/g, '\u0026#039;');

  const stripHtml = (value = '') => String(value).replace(/<[^>]+>/g, '').trim();
  const renderMarkdown = (value = '') => {
    const markdown = String(value);

    if (!window.marked) {
      return `<p>${escapeHtml(markdown).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    }

    window.marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false
    });

    const html = window.marked.parse(markdown);
    return window.DOMPurify ? window.DOMPurify.sanitize(html) : html;
  };
  const formatDate = (value) => new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(value));

  const upsertMeta = (selector, attributes) => {
    let tag = document.head.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      document.head.appendChild(tag);
    }

    Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value));
  };

  const upsertCanonical = (href) => {
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = href;
  };

  const injectSeo = (post) => {
    const title = post.seo?.metaTitle || post.title;
    const description = post.seo?.metaDescription || stripHtml(renderMarkdown(post.content)).slice(0, 160);
    const keywords = post.seo?.keywords || 'Bangladesh weather, SkyCastBD, weather blog';
    const image = post.featuredImage || `${window.location.origin}/logo.png`;
    const url = window.location.href;

    document.title = `${title} | SkyCastBD Weather Blog`;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'article' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[property="article:published_time"]', { property: 'article:published_time', content: new Date(post.date).toISOString() });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
    upsertCanonical(url);

    const jsonLd = document.getElementById('blogJsonLd') || document.createElement('script');
    jsonLd.id = 'blogJsonLd';
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description,
      image,
      datePublished: new Date(post.date).toISOString(),
      dateModified: new Date(post.updatedAt || post.date).toISOString(),
      author: { '@type': 'Organization', name: 'SkyCastBD Editorial Team' },
      publisher: {
        '@type': 'Organization',
        name: 'SkyCastBD',
        logo: { '@type': 'ImageObject', url: `${window.location.origin}/logo.png` }
      },
      mainEntityOfPage: url
    });
    document.head.appendChild(jsonLd);
  };

  const renderPost = (post) => {
    const renderedContent = renderMarkdown(post.content);
    injectSeo(post);
    const description = post.seo?.metaDescription || stripHtml(renderedContent).slice(0, 160);

    article.innerHTML = `
      <header>
        <p class="blog-kicker">SkyCastBD Weather Blog</p>
        <h1 itemprop="headline">${escapeHtml(post.title)}</h1>
        <p class="blog-meta"><time datetime="${escapeHtml(post.date)}" itemprop="datePublished">${escapeHtml(formatDate(post.date))}</time> · <span itemprop="author">SkyCastBD Editorial Team</span></p>
        <p itemprop="description">${escapeHtml(description)}</p>
        ${post.featuredImage ? `<img class="blog-featured-image" src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(post.title)}" loading="eager" decoding="async">` : ''}
      </header>
      <section class="blog-article-content" itemprop="articleBody">${renderedContent}</section>
      <section class="related-articles" aria-label="Related articles">
        <h2>More Articles</h2>
        <ul class="related-list"><li><a href="index.html">Back to all SkyCastBD articles</a></li></ul>
      </section>
    `;
  };

  if (!slug) {
    article.innerHTML = '<p class="cms-message" data-type="error">Missing blog slug.</p>';
    return;
  }

  cms.getBlog(slug)
    .then(renderPost)
    .catch((error) => {
      document.title = 'Blog Post Not Found | SkyCastBD';
      article.innerHTML = `<p class="cms-message" data-type="error">${escapeHtml(error.message || 'Blog post not found.')}</p>`;
    });
})();
