(() => {
  const cms = window.SkyCastBDCms;
  const state = {
    posts: [],
    messages: [],
    products: [],
    orders: [],
    editingSlug: null,
    editingProductId: null,
    messagesLoaded: false,
    productsLoaded: false,
    ordersLoaded: false
  };

  const elements = {
    tableBody: document.getElementById('postsTableBody'),
    messagesTableBody: document.getElementById('messagesTableBody'),
    productsTableBody: document.getElementById('productsTableBody'),
    ordersTableBody: document.getElementById('ordersTableBody'),
    refreshMessages: document.getElementById('refreshMessagesButton'),
    refreshOrders: document.getElementById('refreshOrdersButton'),
    form: document.getElementById('postForm'),
    productForm: document.getElementById('productForm'),
    formTitle: document.getElementById('formTitle'),
    message: document.getElementById('adminMessage'),
    logout: document.getElementById('logoutButton'),
    tabs: document.querySelectorAll('[data-admin-tab]'),
    panels: document.querySelectorAll('[data-admin-panel]')
  };

  if (!cms || !elements.form) return;

  if (!cms.getAdminToken()) {
    window.location.href = 'login.html';
    return;
  }

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '\u0026amp;')
    .replace(/</g, '\u0026lt;')
    .replace(/>/g, '\u0026gt;')
    .replace(/"/g, '\u0026quot;')
    .replace(/'/g, '\u0026#039;');

  const setMessage = (text, type = 'info') => {
    elements.message.textContent = text;
    elements.message.dataset.type = type;
    elements.message.hidden = !text;
  };

  const switchTab = (tabName) => {
    elements.tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.adminTab === tabName));
    elements.panels.forEach((panel) => panel.hidden = panel.dataset.adminPanel !== tabName);

    if (tabName === 'store' && !state.productsLoaded) {
      loadProducts();
    }

    if (tabName === 'orders' && !state.ordersLoaded) {
      loadOrders();
    }

    if (tabName === 'messages' && !state.messagesLoaded) {
      loadMessages();
    }
  };

  const formatDate = (value) => new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));

  const formatPrice = (value = 0) => `৳${Number(value || 0).toLocaleString('en-BD')}`;

  const getStatusClass = (value = '') => String(value).toLowerCase().replace(/\s+/g, '-');

  const stripMarkdown = (value = '') => String(value)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const truncateText = (value = '', maxLength = 60) => {
    const cleanText = stripMarkdown(value);
    if (cleanText.length <= maxLength) return cleanText;
    return `${cleanText.slice(0, maxLength).trim().replace(/[.,;:!?-]+$/, '')}...`;
  };

  const getPayload = () => {
    const formData = new FormData(elements.form);
    return {
      title: String(formData.get('title') || '').trim(),
      slug: String(formData.get('slug') || '').trim().toLowerCase(),
      content: String(formData.get('content') || '').trim(),
      featuredImage: String(formData.get('featuredImage') || '').trim(),
      status: String(formData.get('status') || 'draft'),
      date: String(formData.get('date') || new Date().toISOString()),
      seo: {
        metaTitle: String(formData.get('metaTitle') || '').trim(),
        metaDescription: String(formData.get('metaDescription') || '').trim(),
        keywords: String(formData.get('keywords') || '').trim()
      }
    };
  };

  const fillForm = (post) => {
    state.editingSlug = post.slug;
    elements.formTitle.textContent = 'Edit Post';
    elements.form.title.value = post.title || '';
    elements.form.slug.value = post.slug || '';
    elements.form.content.value = post.content || '';
    elements.form.featuredImage.value = post.featuredImage || '';
    elements.form.status.value = post.status || 'draft';
    elements.form.date.value = post.date ? new Date(post.date).toISOString().slice(0, 16) : '';
    elements.form.metaTitle.value = post.seo?.metaTitle || '';
    elements.form.metaDescription.value = post.seo?.metaDescription || '';
    elements.form.keywords.value = post.seo?.keywords || '';
    switchTab('write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    state.editingSlug = null;
    elements.form.reset();
    elements.formTitle.textContent = 'Write Post';
    elements.form.status.value = 'draft';
    elements.form.date.value = new Date().toISOString().slice(0, 16);
  };

  const renderPosts = () => {
    if (!state.posts.length) {
      elements.tableBody.innerHTML = '<tr><td colspan="5">No posts found. Create your first article from the Write tab.</td></tr>';
      return;
    }

    elements.tableBody.innerHTML = state.posts.map((post) => `
      <tr>
        <td><strong>${escapeHtml(post.title)}</strong><small>${escapeHtml(post.slug)}</small></td>
        <td><span class="status-pill ${escapeHtml(post.status)}">${escapeHtml(post.status)}</span></td>
        <td>${escapeHtml(formatDate(post.date || post.createdAt))}</td>
        <td>${escapeHtml(post.seo?.metaTitle || post.title)}</td>
        <td class="table-actions">
          <button type="button" class="ghost-btn" data-edit="${escapeHtml(post.slug)}">Edit</button>
          <button type="button" class="danger-btn" data-delete="${escapeHtml(post.slug)}">Delete</button>
        </td>
      </tr>
    `).join('');
  };

  const loadPosts = async () => {
    setMessage('Loading posts...', 'info');
    try {
      state.posts = await cms.listBlogs({ includeDrafts: true, status: 'all', limit: 100, auth: true });
      renderPosts();
      setMessage('', 'success');
    } catch (error) {
      if (/token|auth|expired/i.test(error.message)) {
        cms.clearAdminToken();
        window.location.href = 'login.html';
        return;
      }
      setMessage(error.message, 'error');
    }
  };

  const renderMessages = () => {
    if (!elements.messagesTableBody) return;

    if (!state.messages.length) {
      elements.messagesTableBody.innerHTML = '<tr><td colspan="3">No contact messages found yet.</td></tr>';
      return;
    }

    elements.messagesTableBody.innerHTML = state.messages.map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong><small><a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></small></td>
        <td><div class="message-preview">${escapeHtml(item.message)}</div></td>
        <td>${escapeHtml(formatDate(item.createdAt))}</td>
      </tr>
    `).join('');
  };

  const loadMessages = async () => {
    if (!elements.messagesTableBody) return;

    setMessage('Loading contact messages...', 'info');
    elements.messagesTableBody.innerHTML = '<tr><td colspan="3">Loading messages...</td></tr>';

    try {
      state.messages = await cms.listContactMessages();
      state.messagesLoaded = true;
      renderMessages();
      setMessage('', 'success');
    } catch (error) {
      if (/token|auth|expired/i.test(error.message)) {
        cms.clearAdminToken();
        window.location.href = 'login.html';
        return;
      }
      elements.messagesTableBody.innerHTML = '<tr><td colspan="3">Unable to load contact messages.</td></tr>';
      setMessage(error.message, 'error');
    }
  };

  const getProductPayload = () => {
    const formData = new FormData(elements.productForm);
    return {
      title: String(formData.get('title') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      regularPrice: Number(formData.get('regularPrice') || 0),
      salePrice: Number(formData.get('salePrice') || 0),
      imageUrl: String(formData.get('imageUrl') || '').trim(),
      stockStatus: String(formData.get('stockStatus') || 'In Stock')
    };
  };

  const resetProductForm = () => {
    state.editingProductId = null;
    elements.productForm?.reset();
    if (elements.productForm?.stockStatus) {
      elements.productForm.stockStatus.value = 'In Stock';
    }
  };

  const fillProductForm = (product) => {
    state.editingProductId = product.id || product._id;
    elements.productForm.title.value = product.title || '';
    elements.productForm.description.value = product.description || '';
    elements.productForm.regularPrice.value = product.regularPrice ?? 0;
    elements.productForm.salePrice.value = product.salePrice ?? 0;
    elements.productForm.imageUrl.value = product.imageUrl || '';
    elements.productForm.stockStatus.value = product.stockStatus || 'In Stock';
    switchTab('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderProducts = () => {
    if (!elements.productsTableBody) return;

    if (!state.products.length) {
      elements.productsTableBody.innerHTML = '<tr><td colspan="5">No products found. Add the first store item from the form above.</td></tr>';
      return;
    }

    elements.productsTableBody.innerHTML = state.products.map((product) => {
      const productId = product.id || product._id;
      const discounted = Number(product.salePrice || 0) > 0 && Number(product.salePrice) < Number(product.regularPrice || 0);
      const descriptionSnippet = truncateText(product.description, 60);
      return `
        <tr class="compact-product-row">
          <td class="product-summary-cell"><strong>${escapeHtml(product.title)}</strong><small class="product-description-preview">${escapeHtml(descriptionSnippet || 'No description')}</small></td>
          <td>${discounted ? `<small><s>${escapeHtml(formatPrice(product.regularPrice))}</s></small>` : ''}<strong>${escapeHtml(formatPrice(discounted ? product.salePrice : product.regularPrice))}</strong></td>
          <td><span class="status-pill ${escapeHtml(getStatusClass(product.stockStatus))}">${escapeHtml(product.stockStatus || 'In Stock')}</span></td>
          <td>${escapeHtml(formatDate(product.createdAt || new Date()))}</td>
          <td class="table-actions">
            <button type="button" class="ghost-btn" data-edit-product="${escapeHtml(productId)}">Edit</button>
            <button type="button" class="danger-btn" data-delete-product="${escapeHtml(productId)}">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  const loadProducts = async () => {
    if (!elements.productsTableBody) return;

    setMessage('Loading products...', 'info');
    elements.productsTableBody.innerHTML = '<tr><td colspan="5">Loading products...</td></tr>';

    try {
      state.products = await cms.listProducts({ limit: 100 });
      state.productsLoaded = true;
      renderProducts();
      setMessage('', 'success');
    } catch (error) {
      if (/token|auth|expired/i.test(error.message)) {
        cms.clearAdminToken();
        window.location.href = 'login.html';
        return;
      }
      elements.productsTableBody.innerHTML = '<tr><td colspan="5">Unable to load products.</td></tr>';
      setMessage(error.message, 'error');
    }
  };

  const renderOrders = () => {
    if (!elements.ordersTableBody) return;

    if (!state.orders.length) {
      elements.ordersTableBody.innerHTML = '<tr><td colspan="6">No customer orders found yet.</td></tr>';
      return;
    }

    elements.ordersTableBody.innerHTML = state.orders.map((order) => `
      <tr>
        <td><strong>${escapeHtml(order.customerName)}</strong><small>${escapeHtml(order.phone)}</small></td>
        <td><strong>${escapeHtml(order.selectedProduct?.title || 'Product')}</strong><small>${escapeHtml(order.selectedProduct?.id || '')}</small></td>
        <td><div class="order-payment"><strong>${escapeHtml(order.paymentMethod)}</strong><br>TXID: ${escapeHtml(order.transactionId)}</div></td>
        <td><div class="order-address">${escapeHtml(order.shippingAddress)}</div></td>
        <td><span class="status-pill ${escapeHtml(getStatusClass(order.orderStatus))}">${escapeHtml(order.orderStatus || 'Pending')}</span></td>
        <td>${escapeHtml(formatDate(order.createdAt || new Date()))}</td>
      </tr>
    `).join('');
  };

  const loadOrders = async () => {
    if (!elements.ordersTableBody) return;

    setMessage('Loading orders...', 'info');
    elements.ordersTableBody.innerHTML = '<tr><td colspan="6">Loading orders...</td></tr>';

    try {
      state.orders = await cms.listOrders({ status: 'all', limit: 200 });
      state.ordersLoaded = true;
      renderOrders();
      setMessage('', 'success');
    } catch (error) {
      if (/token|auth|expired/i.test(error.message)) {
        cms.clearAdminToken();
        window.location.href = 'login.html';
        return;
      }
      elements.ordersTableBody.innerHTML = '<tr><td colspan="6">Unable to load orders.</td></tr>';
      setMessage(error.message, 'error');
    }
  };
 
  elements.tabs.forEach((tab) => tab.addEventListener('click', () => switchTab(tab.dataset.adminTab)));
  elements.refreshMessages?.addEventListener('click', () => loadMessages());
  elements.refreshOrders?.addEventListener('click', () => loadOrders());

  elements.tableBody.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit]');
    const deleteButton = event.target.closest('[data-delete]');

    if (editButton) {
      const post = state.posts.find((item) => item.slug === editButton.dataset.edit);
      if (post) fillForm(post);
      return;
    }

    if (deleteButton) {
      const slug = deleteButton.dataset.delete;
      if (!window.confirm(`Delete post "${slug}"? This action cannot be undone.`)) return;
      try {
        await cms.deleteBlog(slug);
        setMessage('Post deleted.', 'success');
        await loadPosts();
      } catch (error) {
        setMessage(error.message, 'error');
      }
    }
  });

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = elements.form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setMessage(state.editingSlug ? 'Updating post...' : 'Publishing post...', 'info');

    try {
      const payload = getPayload();
      if (state.editingSlug) {
        await cms.updateBlog(state.editingSlug, payload);
      } else {
        await cms.createBlog(payload);
      }
      resetForm();
      await loadPosts();
      switchTab('manage');
      setMessage('Post saved successfully.', 'success');
    } catch (error) {
      setMessage(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  elements.productsTableBody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-product]');
    const deleteButton = event.target.closest('[data-delete-product]');

    if (editButton) {
      const product = state.products.find((item) => (item.id || item._id) === editButton.dataset.editProduct);
      if (product) fillProductForm(product);
      return;
    }

    if (deleteButton) {
      const productId = deleteButton.dataset.deleteProduct;
      if (!window.confirm('Delete this product? Existing orders will remain for manual records.')) return;
      try {
        await cms.deleteProduct(productId);
        setMessage('Product deleted.', 'success');
        resetProductForm();
        await loadProducts();
      } catch (error) {
        setMessage(error.message, 'error');
      }
    }
  });

  elements.productForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = elements.productForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setMessage(state.editingProductId ? 'Updating product...' : 'Creating product...', 'info');

    try {
      const payload = getProductPayload();
      if (state.editingProductId) {
        await cms.updateProduct(state.editingProductId, payload);
      } else {
        await cms.createProduct(payload);
      }
      resetProductForm();
      await loadProducts();
      setMessage('Product saved successfully.', 'success');
    } catch (error) {
      setMessage(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  document.getElementById('resetFormButton')?.addEventListener('click', resetForm);
  document.getElementById('resetProductFormButton')?.addEventListener('click', resetProductForm);
 
  elements.logout.addEventListener('click', () => {
    cms.clearAdminToken();
    window.location.href = 'login.html';
  });

  resetForm();
  resetProductForm();
  loadPosts();
})();
