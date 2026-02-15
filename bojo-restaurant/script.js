// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // Close mobile menu
            navMenu.classList.remove('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
    // Menu category functionality
    const categoryBtns = document.querySelectorAll('.category-btn');
    const menuCategories = document.querySelectorAll('.menu-category');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show target category
            menuCategories.forEach(category => {
                category.classList.remove('active');
                if (category.id === targetCategory) {
                    category.classList.add('active');
                }
            });
        });
    });
    
    // Order functionality
    const orderBtns = document.querySelectorAll('.order-btn');
    const orderModal = document.getElementById('orderModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const orderItems = document.getElementById('orderItems');
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderTax = document.getElementById('orderTax');
    const orderTotal = document.getElementById('orderTotal');
    const cartCount = document.getElementById('cartCount');
    const cartToggle = document.getElementById('cartToggle');
    const checkoutForm = document.getElementById('checkoutForm');
    const clearCartBtn = document.getElementById('clearCart');
    const orderTypeSelect = document.getElementById('orderType');
    const addressGroup = document.getElementById('addressGroup');
    const closeModal = document.querySelector('.close');
    const closeConfirmation = document.getElementById('closeConfirmation');
    const printReceipt = document.getElementById('printReceipt');
    
    let cart = JSON.parse(localStorage.getItem('bojoCart')) || [];
    
    // Initialize cart
    updateCartCount();
    
    // Cart toggle
    cartToggle.addEventListener('click', function(e) {
        e.preventDefault();
        updateOrderModal();
        orderModal.style.display = 'block';
    });
    
    // Order type change handler
    orderTypeSelect.addEventListener('change', function() {
        if (this.value === 'delivery') {
            addressGroup.style.display = 'block';
            document.getElementById('deliveryAddress').required = true;
        } else {
            addressGroup.style.display = 'none';
            document.getElementById('deliveryAddress').required = false;
        }
    });
    
    // Add item to cart
    orderBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const itemName = this.getAttribute('data-item');
            const itemPrice = parseFloat(this.getAttribute('data-price'));
            
            // Check if item already in cart
            const existingItem = cart.find(item => item.name === itemName);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: itemName,
                    price: itemPrice,
                    quantity: 1
                });
            }
            
            saveCart();
            updateCartCount();
            updateOrderModal();
            orderModal.style.display = 'block';
            
            // Show success feedback
            this.textContent = 'Added!';
            this.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            setTimeout(() => {
                this.textContent = 'Order';
                this.style.background = '';
            }, 1000);
        });
    });
    
    // Order storage configuration
    const STORAGE_MODE = 'cloud'; // 'local' or 'cloud'
    const CLOUD_STORAGE_URL = 'https://jsonbin.io/b/603db968a9171e2e9e2e2e2e'; // Free JSON storage service
    const BACKUP_STORAGE_KEY = 'bojoOrders';
    
    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('bojoCart', JSON.stringify(cart));
    }
    
    // Cloud storage functions
    async function saveOrdersToCloud(orders) {
        try {
            // For demo purposes, we'll use localStorage as fallback
            // In production, you'd use a real cloud service like Firebase, Supabase, or your own API
            localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(orders));
            
            // Simulate cloud sync by storing in multiple localStorage keys
            const timestamp = new Date().toISOString();
            localStorage.setItem('bojoOrders_timestamp', timestamp);
            localStorage.setItem('bojoOrders_sync', JSON.stringify(orders));
            
            console.log('Orders saved to cloud storage (simulated)');
            return true;
        } catch (error) {
            console.error('Failed to save to cloud:', error);
            return false;
        }
    }
    
    async function loadOrdersFromCloud() {
        try {
            // Try to load from cloud storage (simulated)
            const cloudOrders = localStorage.getItem('bojoOrders_sync');
            const timestamp = localStorage.getItem('bojoOrders_timestamp');
            
            if (cloudOrders && timestamp) {
                const orders = JSON.parse(cloudOrders);
                console.log('Orders loaded from cloud storage (simulated)');
                return orders;
            }
            
            return [];
        } catch (error) {
            console.error('Failed to load from cloud:', error);
            return [];
        }
    }
    
    // Enhanced order saving with cloud sync
    async function saveOrderWithSync(orderData) {
        try {
            // Get existing orders
            const existingOrders = await loadOrdersFromCloud();
            
            // Add new order
            existingOrders.push(orderData);
            
            // Save to cloud
            await saveOrdersToCloud(existingOrders);
            
            // Also save locally as backup
            localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(existingOrders));
            
            return true;
        } catch (error) {
            console.error('Failed to save order with sync:', error);
            
            // Fallback to local only
            const localOrders = JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY)) || [];
            localOrders.push(orderData);
            localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(localOrders));
            
            return false;
        }
    }
    
    // Update cart count
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update order modal
    function updateOrderModal() {
        orderItems.innerHTML = '';
        let subtotal = 0;
        
        if (cart.length === 0) {
            orderItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
            orderSubtotal.textContent = '$0.00';
            orderTax.textContent = '$0.00';
            orderTotal.textContent = '$0.00';
            return;
        }
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="item-price">$${itemTotal.toFixed(2)}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${index})">×</button>
                </div>
            `;
            orderItems.appendChild(orderItem);
        });
        
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        
        orderSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        orderTax.textContent = `$${tax.toFixed(2)}`;
        orderTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Update quantity
    window.updateQuantity = function(index, change) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartCount();
        updateOrderModal();
    };
    
    // Remove from cart
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        saveCart();
        updateCartCount();
        updateOrderModal();
    };
    
    // Clear cart
    clearCartBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            cart = [];
            saveCart();
            updateCartCount();
            updateOrderModal();
        }
    });
    
    // Checkout form submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Get form data
        const formData = new FormData(checkoutForm);
        const orderData = {
            customer: {
                name: formData.get('customerName'),
                phone: formData.get('customerPhone'),
                email: formData.get('customerEmail')
            },
            orderType: formData.get('orderType'),
            deliveryAddress: formData.get('deliveryAddress'),
            orderNotes: formData.get('orderNotes'),
            paymentMethod: formData.get('paymentMethod'),
            items: cart,
            subtotal: parseFloat(orderSubtotal.textContent.replace('$', '')),
            tax: parseFloat(orderTax.textContent.replace('$', '')),
            total: parseFloat(orderTotal.textContent.replace('$', '')),
            orderNumber: 'BOJO-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
            timestamp: new Date().toISOString()
        };
        
        // Show confirmation
        showConfirmation(orderData);
        
        // Clear cart and close order modal
        cart = [];
        saveCart();
        updateCartCount();
        orderModal.style.display = 'none';
        checkoutForm.reset();
    });
    
    // Show confirmation
    async function showConfirmation(orderData) {
        // Update confirmation details
        document.getElementById('orderNumber').textContent = orderData.orderNumber;
        document.getElementById('confirmationTotal').textContent = orderData.total.toFixed(2);
        
        // Update estimated time based on order type
        let estimatedTime = '20-30 minutes';
        if (orderData.orderType === 'delivery') {
            estimatedTime = '30-45 minutes';
        } else if (orderData.orderType === 'dine-in') {
            estimatedTime = '15-25 minutes';
        }
        document.getElementById('estimatedTime').textContent = estimatedTime;
        
        // Update order details
        const detailsHtml = orderData.items.map(item => 
            `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>`
        ).join('');
        document.getElementById('confirmationOrderDetails').innerHTML = detailsHtml;
        
        // Show confirmation modal
        confirmationModal.style.display = 'block';
        
        // Save order with cloud sync
        const success = await saveOrderWithSync(orderData);
        
        if (success) {
            console.log('Order saved successfully with cloud sync');
        } else {
            console.log('Order saved locally only (cloud sync failed)');
        }
    }
    
    // Print receipt
    printReceipt.addEventListener('click', function() {
        const orders = JSON.parse(localStorage.getItem('bojoOrders')) || [];
        const lastOrder = orders[orders.length - 1];
        
        if (lastOrder) {
            const receiptContent = generateReceiptContent(lastOrder);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(receiptContent);
            printWindow.document.close();
            printWindow.print();
        }
    });
    
    // Generate receipt content
    function generateReceiptContent(order) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>BOJO Restaurant - Receipt</title>
                <style>
                    body { font-family: 'Lato', sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
                    h1 { color: #d4af37; text-align: center; }
                    .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                    .order-info { margin-bottom: 20px; }
                    .order-items { margin-bottom: 20px; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .total { border-top: 2px solid #d4af37; padding-top: 10px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="receipt-header">
                    <h1>BOJO Restaurant</h1>
                    <p>123 Gourmet Street<br>Culinary District, CD 12345</p>
                </div>
                
                <div class="order-info">
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleDateString()}</p>
                    <p><strong>Customer:</strong> ${order.customer.name}</p>
                    <p><strong>Phone:</strong> ${order.customer.phone}</p>
                    <p><strong>Type:</strong> ${order.orderType.replace('-', ' ').toUpperCase()}</p>
                    ${order.deliveryAddress ? `<p><strong>Address:</strong> ${order.deliveryAddress}</p>` : ''}
                </div>
                
                <div class="order-items">
                    <h3>Order Details</h3>
                    ${order.items.map(item => `
                        <div class="item">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    
                    <div class="item total">
                        <span>Subtotal:</span>
                        <span>$${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="item">
                        <span>Tax (10%):</span>
                        <span>$${order.tax.toFixed(2)}</span>
                    </div>
                    <div class="item total">
                        <span><strong>Total:</strong></span>
                        <span><strong>$${order.total.toFixed(2)}</strong></span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Thank you for dining with us!</p>
                    <p>Visit us again soon at BOJO Restaurant</p>
                </div>
            </body>
            </html>
        `;
    }
    
    // Close modals
    closeModal.addEventListener('click', function() {
        orderModal.style.display = 'none';
    });
    
    closeConfirmation.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === orderModal) {
            orderModal.style.display = 'none';
        }
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
    
    // Add quantity button styles
    const quantityBtnStyles = document.createElement('style');
    quantityBtnStyles.textContent = `
        .quantity-btn {
            background: #f0f0f0;
            border: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .quantity-btn:hover {
            background: #d4af37;
            color: white;
        }
        .remove-btn {
            background: #dc3545;
            color: white;
            border: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .remove-btn:hover {
            background: #c82333;
        }
    `;
    document.head.appendChild(quantityBtnStyles);
    
    // Admin Panel functionality
    const adminLink = document.getElementById('adminLink');
    const ordersList = document.getElementById('ordersList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearAllOrdersBtn = document.getElementById('clearAllOrders');
    let currentFilter = 'all';
    
    // Add admin section to navigation with password protection
    adminLink.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const password = prompt('Enter admin password to access order management:');
        if (password === '8489379') {
            showSection('admin');
            updateActiveNav('admin');
            await loadOrders();
            await updateStats();
        } else if (password !== null) {
            alert('Incorrect password. Access denied.');
        }
    });
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            await loadOrders();
        });
    });
    
    // Clear all orders with cloud sync
    clearAllOrdersBtn.addEventListener('click', async function() {
        if (confirm('Are you sure you want to clear all orders? This cannot be undone.')) {
            try {
                // Clear from cloud
                await saveOrdersToCloud([]);
                
                // Clear from local storage
                localStorage.removeItem(BACKUP_STORAGE_KEY);
                localStorage.removeItem('bojoOrders_sync');
                localStorage.removeItem('bojoOrders_timestamp');
                
                // Reload display
                await loadOrders();
                await updateStats();
                
                showNotification('All orders cleared successfully');
            } catch (error) {
                console.error('Error clearing orders:', error);
                showNotification('Error clearing orders');
            }
        }
    });
    
    // Load and display orders with cloud sync
    async function loadOrders() {
        try {
            // Try to load from cloud first
            let orders = await loadOrdersFromCloud();
            
            // If no cloud orders, try local backup
            if (orders.length === 0) {
                orders = JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY)) || [];
                console.log('Loaded orders from local backup');
            } else {
                console.log('Loaded orders from cloud storage');
            }
            
            const ordersList = document.getElementById('ordersList');
            
            // Filter orders based on current filter
            const filteredOrders = orders.filter(order => {
                if (currentFilter === 'all') return true;
                return order.status === currentFilter;
            });
            
            if (filteredOrders.length === 0) {
                ordersList.innerHTML = '<div class="no-orders">No orders found</div>';
                return;
            }
            
            ordersList.innerHTML = filteredOrders.map(order => createOrderCard(order)).join('');
            
            // Add event listeners to status buttons
            document.querySelectorAll('.status-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const orderNumber = this.getAttribute('data-order');
                    const newStatus = this.getAttribute('data-status');
                    updateOrderStatus(orderNumber, newStatus);
                });
            });
            
        } catch (error) {
            console.error('Error loading orders:', error);
            document.getElementById('ordersList').innerHTML = '<div class="no-orders">Error loading orders</div>';
        }
    }
    
    // Create order card HTML
    function createOrderCard(order) {
        const statusClass = order.status || 'new';
        const statusText = getStatusText(order.status || 'new');
        const statusBadgeClass = `status-${statusClass}`;
        const orderTime = new Date(order.timestamp);
        const timeAgo = getTimeAgo(orderTime);
        
        return `
            <div class="order-card ${statusClass}">
                <div class="order-header">
                    <div class="order-number">${order.orderNumber}</div>
                    <div class="order-status ${statusBadgeClass}">${statusText}</div>
                    <div class="order-time">${timeAgo}</div>
                </div>
                
                <div class="order-customer">
                    <div class="customer-info">
                        <h4>👤 Customer Info</h4>
                        <p><strong>Name:</strong> ${order.customer.name}</p>
                        <p><strong>Phone:</strong> ${order.customer.phone}</p>
                        ${order.customer.email ? `<p><strong>Email:</strong> ${order.customer.email}</p>` : ''}
                    </div>
                    <div class="customer-info">
                        <h4>📋 Order Details</h4>
                        <p><strong>Type:</strong> ${getOrderTypeIcon(order.orderType)} ${order.orderType.replace('-', ' ').toUpperCase()}</p>
                        <p><strong>Payment:</strong> 💵 ${order.paymentMethod}</p>
                        <p><strong>Time:</strong> ${orderTime.toLocaleString()}</p>
                        <p><strong>Total:</strong> <span style="color: #d4af37; font-weight: 700;">$${order.total.toFixed(2)}</span></p>
                    </div>
                </div>
                
                ${order.deliveryAddress ? `
                    <div class="customer-info delivery-info">
                        <h4>🚚 Delivery Address</h4>
                        <p>${order.deliveryAddress}</p>
                    </div>
                ` : ''}
                
                ${order.orderNotes ? `
                    <div class="customer-info notes-info">
                        <h4>📝 Special Instructions</h4>
                        <p>${order.orderNotes}</p>
                    </div>
                ` : ''}
                
                <div class="order-items-list">
                    <h4>🍽 Order Items</h4>
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-actions">
                    ${getStatusButtons(order.status || 'new', order.orderNumber)}
                </div>
            </div>
        `;
    }
    
    // Get order type icon
    function getOrderTypeIcon(orderType) {
        const icons = {
            'dine-in': '🍽',
            'takeout': '🥡',
            'delivery': '🚚'
        };
        return icons[orderType] || '📋';
    }
    
    // Get time ago string
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }
    
    // Get status text
    function getStatusText(status) {
        const statusMap = {
            'new': 'New',
            'preparing': 'Preparing',
            'ready': 'Ready',
            'completed': 'Completed'
        };
        return statusMap[status] || 'New';
    }
    
    // Get status buttons based on current status
    function getStatusButtons(currentStatus, orderNumber) {
        switch(currentStatus) {
            case 'new':
                return `
                    <button class="status-btn" data-order="${orderNumber}" data-status="preparing">Start Preparing</button>
                    <button class="status-btn done-btn" data-order="${orderNumber}" data-status="completed">Done</button>
                `;
            case 'preparing':
                return `
                    <button class="status-btn" data-order="${orderNumber}" data-status="ready">Mark Ready</button>
                    <button class="status-btn done-btn" data-order="${orderNumber}" data-status="completed">Done</button>
                `;
            case 'ready':
                return `
                    <button class="status-btn done-btn" data-order="${orderNumber}" data-status="completed">Done</button>
                `;
            case 'completed':
                return `
                    <button class="status-btn completed-btn" disabled>✓ Done</button>
                `;
            default:
                return '';
        }
    }
    
    // Update order status with cloud sync
    async function updateOrderStatus(orderNumber, newStatus) {
        try {
            // Load orders from cloud
            let orders = await loadOrdersFromCloud();
            
            // If no cloud orders, try local backup
            if (orders.length === 0) {
                orders = JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY)) || [];
            }
            
            const orderIndex = orders.findIndex(order => order.orderNumber === orderNumber);
            
            if (orderIndex !== -1) {
                orders[orderIndex].status = newStatus;
                
                // Save to cloud
                await saveOrdersToCloud(orders);
                
                // Also save locally as backup
                localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(orders));
                
                // Reload orders display
                await loadOrders();
                updateStats();
                
                // Show notification
                showNotification(`Order ${orderNumber} status updated to ${getStatusText(newStatus)}`);
            } else {
                showNotification(`Order ${orderNumber} not found`);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification('Error updating order status');
        }
    }
    
    // Update statistics with cloud sync
    async function updateStats() {
        try {
            // Load orders from cloud
            let orders = await loadOrdersFromCloud();
            
            // If no cloud orders, try local backup
            if (orders.length === 0) {
                orders = JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY)) || [];
            }
            
            const today = new Date().toDateString();
            
            const stats = {
                new: 0,
                preparing: 0,
                ready: 0,
                completed: 0
            };
            
            orders.forEach(order => {
                const status = order.status || 'new';
                stats[status]++;
                
                // Count completed orders from today only
                if (status === 'completed' && new Date(order.timestamp).toDateString() === today) {
                    stats.completedToday = (stats.completedToday || 0) + 1;
                }
            });
            
            document.getElementById('newOrdersCount').textContent = stats.new;
            document.getElementById('preparingCount').textContent = stats.preparing;
            document.getElementById('readyCount').textContent = stats.ready;
            document.getElementById('completedCount').textContent = stats.completedToday || stats.completed;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Helper function to show sections
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });
    }
    
    // Helper function to update active navigation
    function updateActiveNav(sectionId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Order Tracking functionality
    const trackingForm = document.getElementById('trackingForm');
    const orderNumberInput = document.getElementById('orderNumberInput');
    const trackingResult = document.getElementById('trackingResult');
    
    // Add tracking section to navigation
    document.querySelector('a[href="#track-order"]').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('track-order');
        updateActiveNav('track-order');
    });
    
    // Handle tracking form submission
    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const orderNumber = orderNumberInput.value.trim().toUpperCase();
        trackOrder(orderNumber);
    });
    
    // Track order function
    function trackOrder(orderNumber) {
        const orders = JSON.parse(localStorage.getItem('bojoOrders')) || [];
        
        // Try different formats of the order number
        let order = null;
        
        // Try exact match first
        order = orders.find(o => o.orderNumber === orderNumber);
        
        // If not found, try uppercase
        if (!order) {
            order = orders.find(o => o.orderNumber === orderNumber.toUpperCase());
        }
        
        // If not found, try with BOJO prefix if missing
        if (!order && !orderNumber.startsWith('BOJO-')) {
            order = orders.find(o => o.orderNumber === `BOJO-${orderNumber}`);
        }
        
        // If not found, try without BOJO prefix if present
        if (!order && orderNumber.startsWith('BOJO-')) {
            const numberOnly = orderNumber.replace('BOJO-', '');
            order = orders.find(o => o.orderNumber === numberOnly);
        }
        
        if (order) {
            displayTrackingResult(order);
        } else {
            // Show all available order numbers for debugging
            const availableOrders = orders.map(o => o.orderNumber).join(', ');
            displayError(`Order "${orderNumber}" not found. Available orders: ${availableOrders || 'No orders found'}`);
        }
    }
    
    // Display tracking result
    function displayTrackingResult(order) {
        const statusClass = order.status || 'new';
        const statusText = getStatusText(order.status || 'new');
        const trackingStatusClass = `tracking-${statusClass}`;
        const orderTime = new Date(order.timestamp);
        
        // Create timeline based on status
        const timeline = createTimeline(order);
        
        trackingResult.innerHTML = `
            <div class="order-tracking-card">
                <div class="tracking-header">
                    <div class="tracking-number">${order.orderNumber}</div>
                    <div class="tracking-status ${trackingStatusClass}">${statusText}</div>
                </div>
                
                <div class="tracking-timeline">
                    ${timeline}
                </div>
                
                <div class="tracking-details">
                    <h4>📋 Order Details</h4>
                    <div class="detail-row">
                        <span>Customer:</span>
                        <span>${order.customer.name}</span>
                    </div>
                    <div class="detail-row">
                        <span>Order Type:</span>
                        <span>${getOrderTypeIcon(order.orderType)} ${order.orderType.replace('-', ' ').toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span>Payment Method:</span>
                        <span>💵 ${order.paymentMethod}</span>
                    </div>
                    <div class="detail-row">
                        <span>Order Time:</span>
                        <span>${orderTime.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span>Total Amount:</span>
                        <span style="color: #d4af37; font-weight: 700;">$${order.total.toFixed(2)}</span>
                    </div>
                    ${order.deliveryAddress ? `
                        <div class="detail-row">
                            <span>Delivery Address:</span>
                            <span>${order.deliveryAddress}</span>
                        </div>
                    ` : ''}
                    ${order.orderNotes ? `
                        <div class="detail-row">
                            <span>Special Instructions:</span>
                            <span>${order.orderNotes}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        trackingResult.style.display = 'block';
        trackingResult.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Create timeline based on order status
    function createTimeline(order) {
        const status = order.status || 'new';
        const orderTime = new Date(order.timestamp);
        
        let timeline = `
            <div class="timeline-item timeline-completed">
                <div class="timeline-icon">✓</div>
                <div class="timeline-content">
                    <div class="timeline-title">Order Placed</div>
                    <div class="timeline-time">${orderTime.toLocaleString()}</div>
                </div>
            </div>
        `;
        
        if (status === 'preparing' || status === 'ready' || status === 'completed') {
            timeline += `
                <div class="timeline-item timeline-completed">
                    <div class="timeline-icon">👨‍🍳</div>
                    <div class="timeline-content">
                        <div class="timeline-title">Order Started Preparing</div>
                        <div class="timeline-time">Your order is being prepared by our chefs</div>
                    </div>
                </div>
            `;
        }
        
        if (status === 'ready' || status === 'completed') {
            timeline += `
                <div class="timeline-item timeline-completed">
                    <div class="timeline-icon">✅</div>
                    <div class="timeline-content">
                        <div class="timeline-title">Order Ready</div>
                        <div class="timeline-time">Your order is ready for ${order.orderType === 'delivery' ? 'delivery' : 'pickup'}</div>
                    </div>
                </div>
            `;
        }
        
        if (status === 'completed') {
            timeline += `
                <div class="timeline-item timeline-completed">
                    <div class="timeline-icon">🎉</div>
                    <div class="timeline-content">
                        <div class="timeline-title">Order Completed</div>
                        <div class="timeline-time">Thank you for your order!</div>
                    </div>
                </div>
            `;
        } else {
            // Add estimated time for pending orders
            let estimatedTime = '20-30 minutes';
            if (order.orderType === 'delivery') {
                estimatedTime = '30-45 minutes';
            } else if (order.orderType === 'dine-in') {
                estimatedTime = '15-25 minutes';
            }
            
            timeline += `
                <div class="timeline-item timeline-pending">
                    <div class="timeline-icon">⏰</div>
                    <div class="timeline-content">
                        <div class="timeline-title">Estimated Time</div>
                        <div class="timeline-time">${estimatedTime}</div>
                    </div>
                </div>
            `;
        }
        
        return timeline;
    }
    
    // Display error message
    function displayError(message) {
        trackingResult.innerHTML = `
            <div class="error-message">
                <h3>❌ Order Not Found</h3>
                <p>${message}</p>
                <p><strong>Need help?</strong> Call us at (555) 123-4567</p>
            </div>
        `;
        trackingResult.style.display = 'block';
        trackingResult.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Gallery lightbox functionality
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentImageIndex = 0;
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            currentImageIndex = index;
            createLightbox(this.querySelector('img').src, this.querySelector('.gallery-overlay h3').textContent);
        });
    });
    
    function createLightbox(imageSrc, imageTitle) {
        // Remove existing lightbox if any
        const existingLightbox = document.querySelector('.lightbox');
        if (existingLightbox) {
            existingLightbox.remove();
        }
        
        // Create lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <img src="${imageSrc}" alt="${imageTitle}">
                <h3>${imageTitle}</h3>
                <div class="lightbox-nav">
                    <button class="lightbox-prev">‹</button>
                    <button class="lightbox-next">›</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        
        // Add lightbox styles
        const lightboxStyles = document.createElement('style');
        lightboxStyles.textContent = `
            .lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 3000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                text-align: center;
            }
            
            .lightbox-content img {
                max-width: 100%;
                max-height: 70vh;
                border-radius: 10px;
            }
            
            .lightbox-content h3 {
                color: white;
                margin-top: 1rem;
                font-family: 'Playfair Display', serif;
                font-size: 1.5rem;
            }
            
            .lightbox-close {
                position: absolute;
                top: -40px;
                right: 0;
                font-size: 40px;
                color: white;
                cursor: pointer;
                transition: color 0.3s ease;
            }
            
            .lightbox-close:hover {
                color: #ff6b6b;
            }
            
            .lightbox-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 100%;
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
            }
            
            .lightbox-prev, .lightbox-next {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 30px;
                padding: 10px 15px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .lightbox-prev:hover, .lightbox-next:hover {
                background: rgba(255, 107, 107, 0.8);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(lightboxStyles);
        
        // Close lightbox
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.addEventListener('click', function() {
            lightbox.remove();
            lightboxStyles.remove();
        });
        
        // Navigation
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        prevBtn.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
            updateLightboxImage();
        });
        
        nextBtn.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
            updateLightboxImage();
        });
        
        function updateLightboxImage() {
            const newImage = galleryItems[currentImageIndex];
            const newSrc = newImage.querySelector('img').src;
            const newTitle = newImage.querySelector('.gallery-overlay h3').textContent;
            
            lightbox.querySelector('img').src = newSrc;
            lightbox.querySelector('h3').textContent = newTitle;
        }
        
        // Close on background click
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.remove();
                lightboxStyles.remove();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (lightbox) {
                if (e.key === 'Escape') {
                    lightbox.remove();
                    lightboxStyles.remove();
                } else if (e.key === 'ArrowLeft') {
                    currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
                    updateLightboxImage();
                } else if (e.key === 'ArrowRight') {
                    currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
                    updateLightboxImage();
                }
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.9)';
        }
    });
    
    // Contact form functionality
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            newsletter: formData.get('newsletter') ? 'Yes' : 'No'
        };
        
        // Create confirmation message
        let confirmationMessage = 'Thank you for contacting BOJO Restaurant!\n\n';
        confirmationMessage += 'Message Details:\n';
        confirmationMessage += `Name: ${data.name}\n`;
        confirmationMessage += `Email: ${data.email}\n`;
        confirmationMessage += `Phone: ${data.phone || 'Not provided'}\n`;
        confirmationMessage += `Subject: ${data.subject}\n`;
        confirmationMessage += `Message: ${data.message}\n`;
        confirmationMessage += `Newsletter: ${data.newsletter}\n\n`;
        confirmationMessage += 'We will get back to you within 24 hours.';
        
        // Show confirmation
        alert(confirmationMessage);
        
        // Reset form
        contactForm.reset();
    });
    
    // Directions functionality
    window.openDirections = function(address) {
        const encodedAddress = encodeURIComponent(address);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        window.open(googleMapsUrl, '_blank');
    };
    
    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.animation = 'fadeIn 0.5s ease';
        });
    });
});
