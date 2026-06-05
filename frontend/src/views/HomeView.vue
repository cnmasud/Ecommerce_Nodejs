<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ProductGrid from '@/components/ProductGrid.vue'
import { useNotificationStore } from '@/stores/notification'
import { useCartStore } from '@/stores/cart'
import { getCategoryIcon } from '@/utils/categoryIcons'

const router = useRouter()
const notification = useNotificationStore()
const cart = useCartStore()

// ── State ─────────────────────────────────────────────
const products = ref([])
const shops = ref([])
const categories = ref([])
const apiLoading = ref(true)
const apiError = ref('')

// ── Hero carousel ──────────────────────────────────────
const currentSlide = ref(0)
const heroSlides = [
  {
    title: 'Welcome to Marketplace',
    subtitle: 'Discover Amazing Products from Top Sellers',
    description: 'Shop thousands of products with secure checkout and fast delivery.',
    cta: 'Start Shopping',
    ctaLink: '/products',
    bg: 'from-violet-600 to-purple-700',
  },
  {
    title: 'Quality You Can Trust',
    subtitle: 'Verified Sellers & Authentic Products',
    description: 'Every seller is verified. Shop with confidence.',
    cta: 'Browse Shops',
    ctaLink: '/shops',
    bg: 'from-blue-600 to-indigo-700',
  },
  {
    title: 'Fast & Secure Delivery',
    subtitle: 'Track Your Orders in Real-Time',
    description: 'Real-time tracking and secure payment options.',
    cta: 'View Categories',
    ctaLink: '/categories',
    bg: 'from-emerald-500 to-teal-700',
  },
]

let carouselTimer = null
const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % heroSlides.length }
const prevSlide = () => { currentSlide.value = (currentSlide.value + heroSlides.length - 1) % heroSlides.length }
const goToSlide = (i) => { currentSlide.value = i }

// ── Computed ───────────────────────────────────────────
const featuredProducts = computed(() => products.value.slice(0, 4))

// ── Methods ────────────────────────────────────────────
const trimText = (text = '', n = 60) => {
  if (!text) return ''
  return text.length > n ? text.substring(0, n) + '…' : text
}

const quickAddToCart = async (product) => {
  try {
    await cart.addToCart(product, 1)
    notification.success('Added to cart!')
  } catch {
    notification.error('Failed to add to cart')
  }
}

// ── Data loading — NEVER blocks the UI ─────────────────
const loadData = async () => {
  apiLoading.value = true
  apiError.value = ''
  const base = import.meta.env.VITE_BACKENDURL

  // Use Promise.allSettled so one failure doesn't block the rest
  const [productsRes, shopsRes, categoriesRes] = await Promise.allSettled([
    axios.get(`${base}/main/product/recent`),
    axios.get(`${base}/main/shop/recent`),
    axios.get(`${base}/main/category/all`),
  ])

  if (productsRes.status === 'fulfilled') {
    products.value = Array.isArray(productsRes.value.data)
      ? productsRes.value.data
      : Object.values(productsRes.value.data)
  } else {
    const code = productsRes.reason?.response?.status
    if (code === 503) {
      apiError.value = 'The server database is not yet connected. Content will load automatically once the database is ready.'
    } else {
      apiError.value = productsRes.reason?.response?.data?.message || 'Could not load products.'
    }
  }

  if (shopsRes.status === 'fulfilled') {
    shops.value = Array.isArray(shopsRes.value.data)
      ? shopsRes.value.data
      : Object.values(shopsRes.value.data)
  }

  if (categoriesRes.status === 'fulfilled') {
    categories.value = Array.isArray(categoriesRes.value.data)
      ? categoriesRes.value.data
      : Object.values(categoriesRes.value.data)
  }

  apiLoading.value = false
}

onMounted(() => {
  loadData()
  carouselTimer = setInterval(nextSlide, 5000)
})
onUnmounted(() => clearInterval(carouselTimer))
</script>

<template>
  <div class="min-h-screen">

    <!-- ═══════════════════════════════════════════════
         HERO CAROUSEL
    ═══════════════════════════════════════════════ -->
    <section class="relative overflow-hidden select-none">
      <div class="relative h-[320px] sm:h-[400px] md:h-[480px]">
        <transition-group name="fade" tag="div">
          <div
            v-for="(slide, i) in heroSlides"
            :key="i"
            v-show="currentSlide === i"
            :class="`absolute inset-0 bg-gradient-to-br ${slide.bg} flex items-center justify-center`"
          >
            <div class="text-center px-6 text-white max-w-2xl mx-auto">
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3 drop-shadow">
                {{ slide.title }}
              </h1>
              <p class="text-lg sm:text-xl font-semibold mb-2 opacity-90">{{ slide.subtitle }}</p>
              <p class="text-sm sm:text-base mb-6 opacity-80">{{ slide.description }}</p>
              <button
                @click="router.push(slide.ctaLink)"
                class="btn btn-lg bg-white text-primary border-0 hover:bg-white/90 shadow-lg"
              >
                {{ slide.cta }}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </button>
            </div>
          </div>
        </transition-group>

        <!-- Prev / Next arrows -->
        <button @click="prevSlide" class="absolute left-3 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/30 border-0 text-white hover:bg-black/50">❮</button>
        <button @click="nextSlide" class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/30 border-0 text-white hover:bg-black/50">❯</button>

        <!-- Dot indicators -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            v-for="(_, i) in heroSlides"
            :key="i"
            @click="goToSlide(i)"
            :class="`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === i ? 'bg-white scale-125' : 'bg-white/40'}`"
          />
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         FEATURES STRIP
    ═══════════════════════════════════════════════ -->
    <section class="bg-base-100 border-b border-base-300">
      <div class="max-w-screen-xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div v-for="f in [
          { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
          { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
          { icon: '✅', title: 'Verified Sellers', desc: 'Trusted & authenticated' },
          { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
        ]" :key="f.title" class="flex flex-col items-center gap-1 p-3">
          <span class="text-3xl">{{ f.icon }}</span>
          <span class="font-semibold text-sm">{{ f.title }}</span>
          <span class="text-xs text-base-content/60">{{ f.desc }}</span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         DB / API ERROR BANNER
    ═══════════════════════════════════════════════ -->
    <div v-if="apiError && !apiLoading" class="bg-warning/10 border-l-4 border-warning max-w-screen-xl mx-auto mt-6 mx-4 px-4 py-3 rounded-lg flex items-start gap-3">
      <span class="text-xl mt-0.5">⚠️</span>
      <div>
        <p class="text-sm font-semibold text-warning-content">{{ apiError }}</p>
        <button @click="loadData" class="btn btn-xs btn-warning mt-2">Retry</button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════
         LOADING SKELETON (products only)
    ═══════════════════════════════════════════════ -->
    <div v-if="apiLoading" class="max-w-screen-xl mx-auto px-4 py-10">
      <div class="h-6 w-48 bg-base-300 rounded animate-pulse mb-6"></div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="n in 8" :key="n" class="card bg-base-200 shadow-sm">
          <div class="h-40 bg-base-300 animate-pulse rounded-t-xl"></div>
          <div class="p-4 space-y-2">
            <div class="h-3 bg-base-300 rounded animate-pulse"></div>
            <div class="h-3 bg-base-300 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>

      <!-- ═══════════════════════════════════════════════
           FEATURED PRODUCTS
      ═══════════════════════════════════════════════ -->
      <section v-if="featuredProducts.length" class="max-w-screen-xl mx-auto px-4 py-8">
        <div class="flex items-end justify-between mb-5">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold">Featured Products</h2>
            <p class="text-sm text-base-content/60 mt-1">Hand-picked just for you</p>
          </div>
          <router-link to="/products" class="btn btn-outline btn-primary btn-sm hidden sm:flex">
            View All →
          </router-link>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div
            v-for="product in featuredProducts"
            :key="product._id"
            class="card bg-base-100 shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <figure>
              <img
                :src="product.images?.[0] || 'https://placehold.co/400x300?text=No+Image'"
                :alt="product.name"
                class="w-full h-36 md:h-44 object-cover"
                loading="lazy"
              />
            </figure>
            <div class="card-body p-3">
              <h3 class="font-semibold text-sm line-clamp-2">{{ product.name }}</h3>
              <p class="text-xs text-base-content/60 line-clamp-2">{{ trimText(product.description) }}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-primary font-bold">${{ Number(product.price).toFixed(2) }}</span>
              </div>
              <div class="card-actions gap-1 mt-1">
                <router-link :to="'/product/' + product._id" class="btn btn-primary btn-xs flex-1">View</router-link>
                <button
                  class="btn btn-outline btn-xs flex-1"
                  :disabled="product.stock === 0"
                  @click="quickAddToCart(product)"
                >Cart</button>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-5 sm:hidden">
          <router-link to="/products" class="btn btn-outline btn-primary btn-sm w-full max-w-xs">
            View All Products →
          </router-link>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════
           ALL RECENT PRODUCTS
      ═══════════════════════════════════════════════ -->
      <section v-if="products.length" class="max-w-screen-xl mx-auto px-4 py-4">
        <div class="mb-5">
          <h2 class="text-2xl md:text-3xl font-bold">Latest Products</h2>
          <p class="text-sm text-base-content/60 mt-1">Freshly added to our marketplace</p>
        </div>
        <ProductGrid :products="products" />
      </section>

      <!-- ═══════════════════════════════════════════════
           CATEGORIES
      ═══════════════════════════════════════════════ -->
      <section v-if="categories.length" class="bg-base-200 py-10 mt-8">
        <div class="max-w-screen-xl mx-auto px-4">
          <h2 class="text-2xl md:text-3xl font-bold text-center mb-6">Shop by Category</h2>
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <router-link
              v-for="cat in categories"
              :key="cat._id"
              :to="'/category/' + cat._id"
              class="card bg-base-100 shadow hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <div class="card-body items-center justify-center p-4 gap-1">
                <span class="text-3xl">{{ getCategoryIcon(cat.name) }}</span>
                <span class="text-xs font-medium text-center line-clamp-2">{{ cat.name }}</span>
              </div>
            </router-link>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════
           FEATURED SHOPS
      ═══════════════════════════════════════════════ -->
      <section v-if="shops.length" class="max-w-screen-xl mx-auto px-4 py-10">
        <h2 class="text-2xl md:text-3xl font-bold mb-5">Featured Shops</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="shop in shops"
            :key="shop._id"
            class="card bg-base-100 shadow hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <figure class="h-40 overflow-hidden">
              <img
                :src="shop.logo || 'https://placehold.co/600x300?text=' + shop.name"
                :alt="shop.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </figure>
            <div class="card-body p-4">
              <h3 class="card-title text-base">
                {{ shop.name }}
                <span class="badge badge-success badge-sm">Verified</span>
              </h3>
              <p class="text-sm text-base-content/60 line-clamp-2">{{ shop.description }}</p>
              <div class="card-actions mt-2">
                <router-link :to="'/shop/' + shop._id" class="btn btn-primary btn-sm btn-block">
                  Visit Shop →
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════
           EMPTY STATE (no DB data yet)
      ═══════════════════════════════════════════════ -->
      <section v-if="!products.length && !categories.length && !shops.length && !apiError" class="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-bold mb-2">No products yet</h2>
        <p class="text-base-content/60 mb-6">Be the first seller to add products to the marketplace!</p>
        <router-link to="/register" class="btn btn-primary">Get Started</router-link>
      </section>

      <!-- ═══════════════════════════════════════════════
           NEWSLETTER
      ═══════════════════════════════════════════════ -->
      <section class="bg-primary text-primary-content py-12 mt-8">
        <div class="max-w-xl mx-auto px-4 text-center">
          <h2 class="text-2xl md:text-3xl font-bold mb-2">Stay Updated</h2>
          <p class="text-sm opacity-90 mb-6">Subscribe for exclusive deals and new arrivals</p>
          <div class="flex flex-col sm:flex-row gap-2">
            <input type="email" placeholder="Enter your email" class="input flex-1 text-base-content" />
            <button class="btn btn-neutral">Subscribe</button>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
