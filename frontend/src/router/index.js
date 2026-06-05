import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: "smooth" };
  },
  routes: [
    // ── Public ─────────────────────────────────────────
    { path: "/",                name: "home",       component: HomeView },
    { path: "/register",        name: "Register",   component: () => import("../views/RegisterView.vue") },
    { path: "/login",           name: "Login",      component: () => import("../views/LoginView.vue") },

    // ── Products & search ──────────────────────────────
    { path: "/products",        name: "Products",   component: () => import("../views/ProductsView.vue") },
    { path: "/product/:productID", name: "Product", component: () => import("../views/ProductView.vue") },
    { path: "/search",          name: "Search",     component: () => import("../views/SearchView.vue") },

    // ── Categories ─────────────────────────────────────
    { path: "/categories",      name: "Categories", component: () => import("../views/CategoriesView.vue") },
    { path: "/category/:categoryID", name: "Category", component: () => import("../views/CategoryView.vue") },

    // ── Shops ──────────────────────────────────────────
    { path: "/shops",           name: "Shops",      component: () => import("../views/ShopsView.vue") },
    { path: "/shop/:shopID",    name: "Shop",       component: () => import("../views/ShopView.vue") },

    // ── Cart & checkout ────────────────────────────────
    { path: "/cart",            name: "Cart",       component: () => import("../views/CartView.vue") },
    { path: "/checkout",        name: "CheckOut",   component: () => import("../views/CheckOutView.vue") },

    // ── Auth-required ──────────────────────────────────
    { path: "/profile",         name: "Profile",    component: () => import("../views/UserProfileView.vue") },
    { path: "/orders",          name: "Orders",     component: () => import("../views/OrderHistoryView.vue") },
    { path: "/order/:orderID",  name: "OrderDetail",component: () => import("../views/OrderDetailView.vue") },

    // ── Seller ─────────────────────────────────────────
    { path: "/dashboard",       name: "Dashboard",  component: () => import("../views/DashboardView.vue") },

    // ── Admin ──────────────────────────────────────────
    { path: "/admin",           name: "Admin",      component: () => import("../views/admin/AdminView.vue") },

    // ── Catch-all ──────────────────────────────────────
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: {
        template: `
          <div class="max-w-screen-xl mx-auto px-4 py-20 text-center">
            <div class="text-8xl mb-4">404</div>
            <h1 class="text-3xl font-bold mb-2">Page Not Found</h1>
            <p class="text-base-content/60 mb-8">The page you're looking for doesn't exist.</p>
            <router-link to="/" class="btn btn-primary">Go Home</router-link>
          </div>
        `,
      },
    },
  ],
});

export default router;
