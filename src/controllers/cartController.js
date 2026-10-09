import Cart from '../models/cart.js';
import MenuItem from '../models/menuItem.js';
import Restaurant from '../models/restaurant.js';

// GET /api/cart
export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId })
            .populate('restaurant', 'name isActive')
            .populate('items.menuItem', 'name image price');

        if (!cart) {
            return res.status(200).json({ success: true, cart: { items: [], restaurant: null } });
        }

        return res.status(200).json({ success: true, cart });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/cart/items
export const addItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { menuItemId, quantity } = req.body;

        if (!menuItemId || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Menu item ID and valid quantity are required.' });
        }

        // 1. Verify Menu Item exists
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found.' });
        }

        // 2. Verify Item is available
        if (!menuItem.isAvailable) {
            return res.status(400).json({ success: false, message: 'Menu item is currently unavailable.' });
        }

        // 3. Verify Restaurant is active
        const restaurant = await Restaurant.findById(menuItem.restaurant);
        if (!restaurant || !restaurant.isActive) {
            return res.status(400).json({ success: false, message: 'The restaurant is currently inactive or closed.' });
        }

        let cart = await Cart.findOne({ user: userId });

        // 4. Verify Restaurant matches active cart
        if (cart) {
            if (cart.restaurant.toString() !== menuItem.restaurant.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot add items from a different restaurant. Please clear your cart first.'
                });
            }
        } else {
            cart = new Cart({
                user: userId,
                restaurant: menuItem.restaurant,
                items: []
            });
        }

        // 5. Price comes strictly from the database
        const itemPrice = menuItem.price;

        const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += Number(quantity);
            cart.items[itemIndex].price = itemPrice;
        } else {
            cart.items.push({
                menuItem: menuItemId,
                quantity: Number(quantity),
                price: itemPrice
            });
        }

        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate('restaurant', 'name isActive')
            .populate('items.menuItem', 'name image price');

        return res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            cart: populatedCart
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/cart/items/:menuItemId
export const updateItemQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { menuItemId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({ success: false, message: 'A valid quantity is required.' });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found.' });
        }

        const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in cart.' });
        }

        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            const menuItem = await MenuItem.findById(menuItemId);
            if (!menuItem || !menuItem.isAvailable) {
                return res.status(400).json({ success: false, message: 'Menu item is no longer available.' });
            }

            cart.items[itemIndex].quantity = Number(quantity);
            cart.items[itemIndex].price = menuItem.price;
        }

        if (cart.items.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
            return res.status(200).json({ success: true, message: 'Cart is now empty', cart: { items: [], restaurant: null } });
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate('restaurant', 'name isActive')
            .populate('items.menuItem', 'name image price');

        return res.status(200).json({ success: true, message: 'Cart updated successfully', cart: updatedCart });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/cart/items/:menuItemId
export const removeItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { menuItemId } = req.params;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found.' });
        }

        cart.items = cart.items.filter(item => item.menuItem.toString() !== menuItemId);

        if (cart.items.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
            return res.status(200).json({ success: true, message: 'Cart cleared because it became empty', cart: { items: [], restaurant: null } });
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate('restaurant', 'name isActive')
            .populate('items.menuItem', 'name image price');

        return res.status(200).json({ success: true, message: 'Item removed from cart', cart: updatedCart });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        await Cart.findOneAndDelete({ user: userId });

        return res.status(200).json({ success: true, message: 'Cart cleared successfully', cart: { items: [], restaurant: null } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};