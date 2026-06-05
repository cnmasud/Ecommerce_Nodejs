var { User } = require("../../models/user");
var { Shop } = require("../../models/shop");

// Create new shop
async function createShop(req, res, next) {
  try {
    const userID = req.query.userID;
    if (!userID) {
      return res.status(400).json({ success: false, message: "userID is required" });
    }
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: "Shop name is required" });
    }

    const newShop = new Shop({
      name: req.body.name,
      user: userID,
      phone: req.body.phone,
      email: req.body.email,
      description: req.body.description,
      address: {
        country: req.body.country,
        province: req.body.province,
        city: req.body.city,
        postCode: req.body.postCode,
        street: req.body.street,
      },
    });

    await newShop.save();

    // If there is a new logo
    if (req.file) {
      const pathMatch = /(\/uploads)(.+)/g.exec(req.file.path);
      if (pathMatch) {
        await Shop.findByIdAndUpdate(newShop._id, { logo: pathMatch[0] });
      }
    }

    // Add shop to the user
    await User.findByIdAndUpdate(userID, { shop: newShop._id });

    res.status(201).json({ success: true, message: "Shop created successfully!", shop: newShop });
  } catch (err) {
    next(err);
  }
}

// Show shop
async function showShop(req, res, next) {
  try {
    if (!req.query.shopID) {
      return res.status(400).json({ success: false, message: "shopID is required" });
    }
    let shop;
    if (req.query.withProducts === "true") {
      shop = await Shop.findById(req.query.shopID).populate("products");
    } else {
      shop = await Shop.findById(req.query.shopID);
    }
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }
    res.json(shop);
  } catch (err) {
    next(err);
  }
}

// Update Shop
async function updateShop(req, res, next) {
  try {
    if (!req.query.shopID) {
      return res.status(400).json({ success: false, message: "shopID is required" });
    }

    // If there is a new logo
    if (req.file) {
      const pathMatch = /(\/uploads)(.+)/g.exec(req.file.path);
      if (pathMatch) {
        await Shop.findByIdAndUpdate(req.query.shopID, { logo: pathMatch[0] });
      }
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      req.query.shopID,
      {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        description: req.body.description,
        address: {
          country: req.body.country,
          province: req.body.province,
          city: req.body.city,
          postCode: req.body.postCode,
          street: req.body.street,
        },
      },
      { new: true },
    );

    if (!updatedShop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    res.json({ success: true, message: "Shop updated successfully!", shop: updatedShop });
  } catch (err) {
    next(err);
  }
}

// Delete Shop
async function deleteShop(req, res, next) {
  try {
    if (!req.query.shopID) {
      return res.status(400).json({ success: false, message: "shopID is required" });
    }

    const shop = await Shop.findById(req.query.shopID);
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    // Update user, remove shop from user
    await User.findByIdAndUpdate(shop.user, {
      $unset: { shop: 1 },
    });

    // Delete Shop
    await Shop.findByIdAndDelete(req.query.shopID);

    res.json({ success: true, message: "Shop deleted successfully!" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createShop,
  showShop,
  updateShop,
  deleteShop,
};
