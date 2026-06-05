<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ProductGrid from '@/components/ProductGrid.vue'
import { getCategoryIcon } from '@/utils/categoryIcons'

const route   = useRoute()
const cat     = ref(null)
const products= ref([])
const loading = ref(true)
const error   = ref('')
const sortBy  = ref('newest')
const base    = import.meta.env.VITE_BACKENDURL

onMounted(async () => {
  try {
    const [catRes, allRes] = await Promise.all([
      axios.get(`${base}/main/category/show`, { params: { categoryID: route.params.categoryID } }),
      axios.get(`${base}/main/product/recent`),
    ])
    cat.value = catRes.data

    // Get products that belong to this category
    const all = Array.isArray(allRes.data) ? allRes.data : Object.values(allRes.data)
    products.value = all.filter(p =>
      p.categories?.some(c =>
        (c._id || c) === route.params.categoryID ||
        (typeof c === 'object' && c._id === route.params.categoryID)
      )
    )
  } catch (e) {
    error.value = e?.response?.data?.message || 'Failed to load category.'
  } finally {
    loading.value = false
  }
})

const sorted = computed(() => {
  const list = [...products.value]
  if (sortBy.value === 'price-asc')  list.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price-desc') list.sort((a, b) => b.price - a.price)
  if (sortBy.value === 'name')       list.sort((a, b) => a.name.localeCompare(b.name))
  return list
})
</script>

<template>
  <div>
    <!-- Skeleton -->
    <div v-if="loading" class="max-w-screen-xl mx-auto px-3 py-6 space-y-4">
      <div class="h-40 bg-base-300 animate-pulse rounded-xl"></div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="n in 8" :key="n" class="h-56 bg-base-200 animate-pulse rounded-xl"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-screen-xl mx-auto px-3 py-16 text-center">
      <p class="text-error">{{ error }}</p>
    </div>

    <template v-else>
      <!-- Hero banner -->
      <div class="bg-gradient-to-br from-primary/20 to-secondary/20 py-10 px-4">
        <div class="max-w-screen-xl mx-auto flex items-center gap-4">
          <span class="text-5xl">{{ getCategoryIcon(cat?.name) }}</span>
          <div>
            <h1 class="text-2xl md:text-4xl font-bold">{{ cat?.name }}</h1>
            <p class="text-sm text-base-content/60 mt-1">{{ products.length }} products in this category</p>
          </div>
        </div>
      </div>

      <!-- Products section -->
      <div class="max-w-screen-xl mx-auto px-3 md:px-6 py-6">
        <!-- Sort bar -->
        <div class="flex items-center justify-between mb-5">
          <p class="text-sm text-base-content/60">
            Showing <strong>{{ products.length }}</strong> products
          </p>
          <select v-model="sortBy" class="select select-bordered select-sm w-44">
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        <!-- Empty -->
        <div v-if="!sorted.length" class="text-center py-16">
          <div class="text-5xl mb-3">📦</div>
          <h3 class="text-lg font-semibold">No products in this category yet</h3>
          <router-link to="/products" class="btn btn-primary btn-sm mt-4">Browse All Products</router-link>
        </div>

        <!-- Grid -->
        <ProductGrid v-else :products="sorted" />
      </div>
    </template>
  </div>
</template>
