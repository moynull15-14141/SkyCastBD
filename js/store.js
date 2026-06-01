(() => {
  const cms = window.SkyCastBDCms;
  const productGrid = document.getElementById('storeProductGrid');
  const status = document.getElementById('storeStatus');
  const modal = document.getElementById('checkoutModal');
  const modalClose = document.getElementById('checkoutModalClose');
  const checkoutForm = document.getElementById('checkoutForm');
  const selectedProductTitle = document.getElementById('selectedProductTitle');
  const selectedProductPrice = document.getElementById('selectedProductPrice');
  const orderProductId = document.getElementById('orderProductId');
  const orderProductTitle = document.getElementById('orderProductTitle');
  const orderStatus = document.getElementById('orderStatus');
  let products = [];

  if (!cms || !productGrid || !modal || !checkoutForm) return;

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '\u0026amp;')
    .replace(/</g, '\u0026lt;')
    .replace(/>/g, '\u0026gt;')
    .replace(/"/g, '\u0026quot;')
    .replace(/'/g, '\u0026#039;');

  const formatPrice = (value = 0) => `৳${Number(value || 0).toLocaleString('en-BD')}`;

  const stripMarkdown = (value = '') => String(value)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const truncateText = (value = '', maxLength = 140) => {
    const cleanText = stripMarkdown(value);
    if (cleanText.length <= maxLength) return cleanText;
    return `${cleanText.slice(0, maxLength).trim().replace(/[.,;:!?-]+$/, '')}...`;
  };

  const renderInlineMarkdown = (value = '') => escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  const renderProductMarkdown = (value = '') => {
    const source = String(value || '').replace(/\r\n/g, '\n').trim();
    if (!source) return '<p>No additional product details available.</p>';

    const blocks = source.split(/\n{2,}/).map((block) => {
      const trimmed = block.trim();
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);

      if (headingMatch) {
        const level = Math.min(headingMatch[1].length + 2, 4);
        return `<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`;
      }

      const lines = trimmed.split('\n').map((line) => renderInlineMarkdown(line.trim())).filter(Boolean);
      return `<p>${lines.join('<br>')}</p>`;
    });

    return blocks.join('');
  };

  const getActivePrice = (product) => Number(product.salePrice || 0) > 0 ? Number(product.salePrice) : Number(product.regularPrice || 0);

  const hasDiscount = (product) => Number(product.salePrice || 0) > 0 && Number(product.salePrice) < Number(product.regularPrice || 0);

  const setStatus = (message, type = 'info') => {
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
    status.hidden = !message;
  };

  const setOrderStatus = (message, type = 'info') => {
    if (!orderStatus) return;
    orderStatus.textContent = message;
    orderStatus.dataset.type = type;
    orderStatus.hidden = !message;
  };

  const renderProducts = () => {
    const visibleProducts = products.filter((product) => product.stockStatus === 'In Stock');

    if (!visibleProducts.length) {
      productGrid.innerHTML = '<article class="glass-card store-empty"><h2>No products available</h2><p>Fresh SkyCastBD store items will appear here soon.</p></article>';
      return;
    }

    productGrid.innerHTML = visibleProducts.map((product) => {
      const discounted = hasDiscount(product);
      const image = product.imageUrl || '../logo.png';
      const descriptionExcerpt = truncateText(product.description, 145);
      return `
        <article class="store-product-card glass-card">
          <div class="store-product-image-wrap">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}" loading="lazy" decoding="async">
            ${discounted ? '<span class="store-badge">Sale</span>' : ''}
          </div>
          <div class="store-product-body">
            <span class="stock-pill">${escapeHtml(product.stockStatus || 'In Stock')}</span>
            <h2>${escapeHtml(product.title)}</h2>
            <p class="store-product-excerpt">${escapeHtml(descriptionExcerpt || 'No description available.')}</p>
            <div class="store-price-row">
              ${discounted ? `<span class="store-price-original">${escapeHtml(formatPrice(product.regularPrice))}</span>` : ''}
              <strong class="store-price-active">${escapeHtml(formatPrice(getActivePrice(product)))}</strong>
            </div>
            <button class="primary-btn store-buy-btn" type="button" data-buy-product="${escapeHtml(product.id || product._id)}">Buy Now</button>
          </div>
        </article>
      `;
    }).join('');
  };

  const openModal = (product) => {
    orderProductId.value = product.id || product._id;
    orderProductTitle.value = product.title;
    selectedProductTitle.textContent = product.title;
    selectedProductPrice.textContent = formatPrice(getActivePrice(product));
    const descriptionTarget = document.getElementById('selectedProductDescription');
    if (descriptionTarget) {
      descriptionTarget.innerHTML = renderProductMarkdown(product.description);
    }
    setOrderStatus('', 'info');
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    checkoutForm.customerName.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    checkoutForm.reset();
    orderProductId.value = '';
    orderProductTitle.value = '';
    setOrderStatus('', 'info');
  };

  const loadProducts = async () => {
    setStatus('Loading store products...', 'info');
    try {
      products = await cms.listProducts({ limit: 100 });
      renderProducts();
      setStatus('', 'success');
    } catch (error) {
      productGrid.innerHTML = '<article class="glass-card store-empty"><h2>Unable to load products</h2><p>Please try again later.</p></article>';
      setStatus(error.message || 'Unable to load store products.', 'error');
    }
  };

  productGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-buy-product]');
    if (!button) return;

    const product = products.find((item) => (item.id || item._id) === button.dataset.buyProduct);
    if (product) openModal(product);
  });

  modalClose?.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });

  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }

    const submitButton = checkoutForm.querySelector('button[type="submit"]');
    const formData = new FormData(checkoutForm);
    submitButton.disabled = true;
    setOrderStatus('Submitting your order...', 'info');

    try {
      await cms.createOrder({
        customerName: String(formData.get('customerName') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        shippingAddress: String(formData.get('shippingAddress') || '').trim(),
        selectedProduct: {
          id: String(formData.get('productId') || '').trim(),
          title: String(formData.get('productTitle') || '').trim()
        },
        paymentMethod: String(formData.get('paymentMethod') || 'bKash'),
        transactionId: String(formData.get('transactionId') || '').trim()
      });
      checkoutForm.reset();
      setOrderStatus('Order submitted successfully. Our team will verify your payment manually.', 'success');
    } catch (error) {
      setOrderStatus(error.message || 'Unable to submit your order. Please try again.', 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  loadProducts();
})();
