# Recommended Blog Folder Structure

```text
blog/
├── index.html
└── posts/
    ├── article-template.html
    ├── monsoon-rainfall-bangladesh.html
    ├── cyclone-preparation-bangladesh.html
    └── global-city-weather-comparison.html

css/
└── blog.css
```

## Why this structure works

- Keeps blog listing and individual post pages clearly separated.
- Uses a reusable article template for fast, consistent publishing.
- Centralizes blog-specific styles in one file for easier maintenance.
- Supports SEO scaling with static HTML pages and clean internal linking.

## Publishing checklist for each new article

1. Copy `blog/posts/article-template.html` to a new slug file.
2. Update title, description, canonical URL, and OG/Twitter tags.
3. Add structured data (`BlogPosting`) metadata.
4. Add the new card in `blog/index.html`.
5. Add 2-3 internal related links to strengthen SEO crawl paths.
