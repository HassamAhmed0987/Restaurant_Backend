import Category from '../models/Category.js';
import Restaurant from '../models/restaurant.js';

// 1. Create Category
export const createCategory = async (req, res) => {
    try {
        const { name, description, image, sortOrder, restaurant } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required."
            });
        }

        // Multi-tenancy target restaurant determination
        let targetRestaurantId;
        if (req.user.role === 'SUPER_ADMIN') {
            targetRestaurantId = restaurant;
            if (!targetRestaurantId) {
                return res.status(400).json({
                    success: false,
                    message: "Restaurant ID is required when creating category as Super Admin."
                });
            }
        } else if (req.user.role === 'ADMIN') {
            targetRestaurantId = req.user.restaurantId;
        }

        // Verify Restaurant exists
        const restaurantExists = await Restaurant.findById(targetRestaurantId);
        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: "Associated restaurant not found."
            });
        }

        // Duplicate Category Check for the SAME Restaurant
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            restaurant: targetRestaurantId
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "A category with this name already exists in this restaurant."
            });
        }

        const category = await Category.create({
            name,
            description,
            image,
            sortOrder: sortOrder !== undefined ? sortOrder : 0,
            restaurant: targetRestaurantId
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully!",
            data: category
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get All Categories for a Restaurant (Sorted by sortOrder)
export const getCategoriesByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        // Public/Customer ke liye sirf active categories, jabke logged-in admin ke liye sab
        const filter = { restaurant: restaurantId };
        
        const isAuthorizedAdmin = 
            req.user?.role === 'SUPER_ADMIN' || 
            (req.user?.role === 'ADMIN' && req.user?.restaurantId?.toString() === restaurantId);

        if (!isAuthorizedAdmin) {
            filter.isActive = true;
        }

        const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Update Category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        // Multi-tenancy ownership validation
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const isOwningAdmin = req.user.role === 'ADMIN' && req.user.restaurantId?.toString() === category.restaurant.toString();

        if (!isSuperAdmin && !isOwningAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot modify categories of another restaurant."
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully!",
            data: updatedCategory
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Delete Category (Soft or Hard Delete)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        // Multi-tenancy ownership validation
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const isOwningAdmin = req.user.role === 'ADMIN' && req.user.restaurantId?.toString() === category.restaurant.toString();

        if (!isSuperAdmin && !isOwningAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot delete categories of another restaurant."
            });
        }

        await Category.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully!"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};