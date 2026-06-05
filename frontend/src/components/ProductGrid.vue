<script>
import { useCartStore } from "@/stores/cart";
import { useNotificationStore } from "@/stores/notification";

export default {
  props: {
    // Accepts both Array and Object (keyed by index)
    products: {
      type: [Array, Object],
      default: () => [],
    },
  },

  setup() {
    const cartStore = useCartStore();
    const notification = useNotificationStore();
    return { cartStore, notification };
  },

  computed: {
    productList() {
      if (!this.products) return [];
      if (Array.isArray(this.products)) return this.products;
      return Object.values(this.products);
    },
  },

  methods: {
    // Trim text without appending "..." for short strings
    trimText(text = "", n = 20) {
      if (!text) return "";
      return text.length > n ? text.substring(0, n) + "..." : text;
    },

    // Safely get the first image – fallback to placeholder
    getImage(product) {
      if (product.images && product.images.length > 0 && product.images[0]) {
        return product.images[0];
      }
      return "https://placehold.co/400x300?text=No+Image";
    },

    async addToCart(product) {
      const result = await this.cartStore.addToCart(product, 1);
      if (result && result.success) {
        this.notification.success("Added to cart!");
      } else {
        this.notification.error(result?.message || "Failed to add to cart");
      }
    },
  },
};
</script>

<template>
  <div v-if="productList.length === 0" class="text-center py-12">
    <div class="text-5xl mb-4">📦</div>
    <p class="text-base-content/60">No products found.</p>
  </div>

  <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
    <div
      v-for="product in productList"
      :key="product._id"
      class="card bg-base-100 shadow-md rounded-xl hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
    >
      <figure class="relative">
        <img
          :src="getImage(product)"
          :alt="product.name"
          class="w-full h-36 sm:h-44 md:h-48 object-cover"
          loading="lazy"
        />
        <div v-if="product.stock === 0" class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-xl">
          <span class="badge badge-error text-white font-semibold">Out of Stock</span>
        </div>
      </figure>
      <div class="card-body p-3 md:p-4">
        <h2 class="card-title text-sm md:text-base line-clamp-2 leading-tight">
          {{ product.name }}
        </h2>
        <p class="text-xs md:text-sm text-base-content/60 line-clamp-2">
          {{ trimText(product.description, 80) }}
        </p>
        <div class="flex items-center justify-between mt-2">
          <span class="text-primary font-bold text-base md:text-lg">
            ${{ Number(product.price).toFixed(2) }}
          </span>
          <span v-if="product.stock > 0 && product.stock < 10" class="badge badge-warning badge-sm">
            Low Stock
          </span>
        </div>
        <div class="card-actions justify-between mt-2 gap-1">
          <router-link
            :to="'/product/' + product._id"
            class="btn btn-primary btn-xs md:btn-sm flex-1"
          >
            View
          </router-link>
          <button
            class="btn btn-outline btn-xs md:btn-sm flex-1"
            :disabled="product.stock === 0"
            @click="addToCart(product)"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
