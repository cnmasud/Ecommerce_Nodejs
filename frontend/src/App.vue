<script>
import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useCartStore } from "@/stores/cart";
import ToastNotification from "@/components/ToastNotification.vue";
import SearchBar from "@/components/SearchBar.vue";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

export default {
  components: { ToastNotification, SearchBar },

  setup() {
    const userStore = useUserStore();
    const cartStore = useCartStore();
    return { userStore, cartStore };
  },

  data() {
    return {
      user: {
        isLoggedIn: false,
        token: "",
        role: "",
        id: "",
        email: "",
        username: "",
        avatar: DEFAULT_AVATAR,
      },
      showMobileMenu: false,
      showMobileSearch: false,
    };
  },

  async created() {
    const token = this.userStore.getToken;
    if (token) {
      const tokenUser = this.userStore.getUser;
      if (!tokenUser) {
        this.userStore.removeToken();
        this.cartStore.loadFromLocalStorage();
        return;
      }
      this.user.isLoggedIn = true;
      this.user.token = token;
      this.user.role = tokenUser.role;
      this.user.id = tokenUser.id;
      try {
        const userRes = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/user/show",
          params: { userID: tokenUser.id },
        });
        const data = userRes.data;
        this.user.email = data.email || "";
        this.user.username = data.username || "";
        this.user.avatar = data.avatar || DEFAULT_AVATAR;
      } catch (e) {
        console.error("Failed to load user profile:", e);
      }
      await this.cartStore.fetchCart();
    } else {
      this.cartStore.loadFromLocalStorage();
    }
  },

  methods: {
    logOut() {
      this.userStore.removeToken();
      this.cartStore.resetCart();
      this.user.isLoggedIn = false;
      this.user.role = "";
      this.user.id = "";
      this.user.email = "";
      this.user.username = "";
      this.user.avatar = DEFAULT_AVATAR;
      this.$router.push("/");
    },
  },
};
</script>

<template>
  <!-- ───────────────── TOP ANNOUNCEMENT BAR (desktop) ───────────────── -->
  <div class="hidden md:block bg-primary text-primary-content text-xs py-2 text-center">
    🚚 Free shipping on orders over $50 &nbsp;|&nbsp; 📞 +1 (555) 123-4567 &nbsp;|&nbsp; 📧 support@marketplace.com
  </div>

  <!-- ───────────────── STICKY HEADER ───────────────── -->
  <header class="sticky top-0 z-50 bg-base-100 shadow-md">
    <div class="navbar px-3 md:px-6 max-w-screen-xl mx-auto gap-2">

      <!-- LOGO -->
      <div class="navbar-start">
        <!-- Hamburger mobile -->
        <button
          class="btn btn-ghost btn-sm btn-square lg:hidden mr-1"
          @click="showMobileMenu = !showMobileMenu"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <router-link to="/" class="flex items-center gap-1 font-extrabold text-lg md:text-xl text-primary">
          🛒 <span>Marketplace</span>
        </router-link>
      </div>

      <!-- SEARCH – desktop -->
      <div class="navbar-center hidden lg:flex flex-1 max-w-xl mx-4">
        <SearchBar />
      </div>

      <!-- RIGHT ACTIONS -->
      <div class="navbar-end flex items-center gap-1">
        <!-- Mobile search toggle -->
        <button
          class="btn btn-ghost btn-sm btn-square lg:hidden"
          @click="showMobileSearch = !showMobileSearch"
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>

        <!-- Cart -->
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-sm btn-square" aria-label="Cart">
            <div class="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span v-if="cartStore.itemCount > 0" class="badge badge-xs badge-primary indicator-item">
                {{ cartStore.itemCount }}
              </span>
            </div>
          </label>
          <div tabindex="0" class="dropdown-content mt-2 card card-compact w-72 bg-base-100 shadow-2xl z-50">
            <div class="card-body">
              <span class="font-bold text-lg">Cart ({{ cartStore.itemCount }})</span>
              <div class="divider my-1"></div>
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="font-bold text-primary">${{ Number(cartStore.subtotal || 0).toFixed(2) }}</span>
              </div>
              <router-link to="/cart" class="btn btn-primary btn-sm btn-block mt-2">View Cart</router-link>
            </div>
          </div>
        </div>

        <!-- Login button (guest) -->
        <router-link v-if="!user.isLoggedIn" to="/login" class="btn btn-primary btn-sm hidden sm:flex">
          Login
        </router-link>

        <!-- User avatar dropdown -->
        <div v-if="user.isLoggedIn" class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle avatar btn-sm" aria-label="Account">
            <div class="w-9 rounded-full ring-2 ring-primary ring-offset-1">
              <img :src="user.avatar" :alt="user.username || 'User'" />
            </div>
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow-2xl bg-base-100 rounded-box w-56 z-50 mt-2">
            <li class="menu-title px-2 py-1 text-sm font-semibold">{{ user.username || user.email }}</li>
            <li><router-link to="/profile">👤 Profile</router-link></li>
            <li><router-link to="/orders">📦 My Orders</router-link></li>
            <li v-if="user.role === 'seller'"><router-link to="/dashboard">🏪 Dashboard</router-link></li>
            <li v-if="user.role === 'admin'"><router-link to="/admin">⚙️ Admin</router-link></li>
            <li><hr class="my-1"/></li>
            <li><a @click="logOut" class="text-error">🚪 Logout</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mobile search bar -->
    <div v-if="showMobileSearch" class="px-3 pb-3 lg:hidden border-t border-base-300">
      <SearchBar />
    </div>

    <!-- Desktop nav links -->
    <div class="hidden lg:block border-t border-base-300 bg-base-100">
      <div class="max-w-screen-xl mx-auto px-6">
        <ul class="menu menu-horizontal py-0 gap-1 text-sm font-medium">
          <li><router-link to="/" exact-active-class="text-primary font-bold">Home</router-link></li>
          <li><router-link to="/products" active-class="text-primary font-bold">Products</router-link></li>
          <li><router-link to="/categories" active-class="text-primary font-bold">Categories</router-link></li>
          <li><router-link to="/shops" active-class="text-primary font-bold">Shops</router-link></li>
        </ul>
      </div>
    </div>

    <!-- Mobile fly-out menu -->
    <div v-if="showMobileMenu" class="lg:hidden bg-base-100 border-t border-base-300 shadow-md px-2 pb-2">
      <ul class="menu menu-sm" @click="showMobileMenu = false">
        <li><router-link to="/">🏠 Home</router-link></li>
        <li><router-link to="/products">🛍️ Products</router-link></li>
        <li><router-link to="/categories">📦 Categories</router-link></li>
        <li><router-link to="/shops">🏪 Shops</router-link></li>
        <template v-if="!user.isLoggedIn">
          <li class="divider"></li>
          <li><router-link to="/login">🔐 Login</router-link></li>
          <li><router-link to="/register">📝 Register</router-link></li>
        </template>
      </ul>
    </div>
  </header>

  <!-- ───────────────── TOAST ───────────────── -->
  <ToastNotification />

  <!-- ───────────────── PAGE CONTENT ───────────────── -->
  <!-- pb-16 on mobile to stay above bottom nav -->
  <div class="pb-16 md:pb-0">
    <router-view :userID="user.id" />
  </div>

  <!-- ───────────────── DESKTOP FOOTER ───────────────── -->
  <footer class="hidden md:block bg-base-200 border-t border-base-300 mt-8">
    <div class="footer max-w-screen-xl mx-auto px-6 py-10 grid-cols-2 md:grid-cols-4">
      <div>
        <span class="footer-title">Marketplace</span>
        <p class="text-sm text-base-content/70 max-w-xs">Your one-stop shop for quality products from verified sellers.</p>
      </div>
      <div>
        <span class="footer-title">Shop</span>
        <router-link to="/products" class="link link-hover text-sm">Products</router-link>
        <router-link to="/categories" class="link link-hover text-sm">Categories</router-link>
        <router-link to="/shops" class="link link-hover text-sm">Shops</router-link>
      </div>
      <div>
        <span class="footer-title">Account</span>
        <router-link to="/login" class="link link-hover text-sm">Login</router-link>
        <router-link to="/register" class="link link-hover text-sm">Register</router-link>
        <router-link to="/orders" class="link link-hover text-sm">Orders</router-link>
      </div>
      <div>
        <span class="footer-title">Support</span>
        <a class="link link-hover text-sm">About Us</a>
        <a class="link link-hover text-sm">Contact</a>
        <a class="link link-hover text-sm">FAQ</a>
      </div>
    </div>
    <div class="footer footer-center bg-base-300 px-6 py-4 text-xs text-base-content/60">
      <p>Copyright © 2024 Marketplace. All rights reserved.</p>
    </div>
  </footer>

  <!-- ───────────────── MOBILE BOTTOM NAV ───────────────── -->
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-50 bg-base-100 border-t border-base-300 shadow-lg">
    <div class="flex items-stretch justify-around h-14">
      <!-- Home -->
      <router-link
        to="/"
        class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs hover:text-primary transition-colors"
        :class="$route.path === '/' ? 'text-primary font-semibold' : 'text-base-content/60'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        <span>Home</span>
      </router-link>

      <!-- Search -->
      <router-link
        to="/products"
        class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs hover:text-primary transition-colors"
        :class="$route.path.startsWith('/product') ? 'text-primary font-semibold' : 'text-base-content/60'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <span>Search</span>
      </router-link>

      <!-- Cart -->
      <router-link
        to="/cart"
        class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs hover:text-primary transition-colors"
        :class="$route.path === '/cart' ? 'text-primary font-semibold' : 'text-base-content/60'"
      >
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span
            v-if="cartStore.itemCount > 0"
            class="absolute -top-1.5 -right-1.5 bg-primary text-primary-content text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
          >{{ cartStore.itemCount }}</span>
        </div>
        <span>Cart</span>
      </router-link>

      <!-- Orders (logged in) / Login (guest) -->
      <router-link
        v-if="user.isLoggedIn"
        to="/orders"
        class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs hover:text-primary transition-colors"
        :class="$route.path === '/orders' ? 'text-primary font-semibold' : 'text-base-content/60'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <span>Orders</span>
      </router-link>

      <router-link
        v-else
        to="/login"
        class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs hover:text-primary transition-colors"
        :class="$route.path === '/login' ? 'text-primary font-semibold' : 'text-base-content/60'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
        </svg>
        <span>Login</span>
      </router-link>

      <!-- Profile -->
      <router-link
        v-if="user.isLoggedIn"
        to="/profile"
        class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs hover:text-primary transition-colors"
        :class="$route.path === '/profile' ? 'text-primary font-semibold' : 'text-base-content/60'"
      >
        <div class="w-5 h-5 rounded-full overflow-hidden ring-1 ring-primary">
          <img :src="user.avatar" alt="me" class="w-full h-full object-cover" />
        </div>
        <span>Me</span>
      </router-link>
    </div>
  </nav>
</template>
