#!/usr/bin/env node

/**
 * Test Script for SketchShaper Pro APIs
 * Run: node test-sketchshaper-pro.mjs
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api'; // Change to your server URL
const TEST_IMAGE_PATH = './test-image.png'; // Create a test image

console.log('🧪 Testing SketchShaper Pro APIs\n');

// Test 1: Create Category
async function testCreateCategory() {
  console.log('1️⃣ Testing: Create Category');
  try {
    const formData = new FormData();
    formData.append('name', 'Test Category ' + Date.now());
    
    // If you have a test image, uncomment:
    // formData.append('preview_image', fs.createReadStream(TEST_IMAGE_PATH));

    const response = await axios.post(`${BASE_URL}/sketchshaper-pro-categories`, formData, {
      headers: formData.getHeaders()
    });

    console.log('✅ Category created:', response.data.data);
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 2: Get Categories
async function testGetCategories() {
  console.log('\n2️⃣ Testing: Get Categories');
  try {
    const response = await axios.get(`${BASE_URL}/sketchshaper-pro-categories`);
    console.log('✅ Categories retrieved:', response.data.data.length, 'categories');
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return [];
  }
}

// Test 3: Get Categories with Pagination
async function testGetCategoriesWithPagination() {
  console.log('\n3️⃣ Testing: Get Categories with Pagination');
  try {
    const response = await axios.get(`${BASE_URL}/sketchshaper-pro-categories/pages?page=1&limit=10&order=desc`);
    console.log('✅ Paginated categories:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 4: Initialize Upload
async function testInitializeUpload(categoryId) {
  console.log('\n4️⃣ Testing: Initialize Upload');
  try {
    const response = await axios.post(`${BASE_URL}/sketchshaper-pro-files/initialize`, {
      name: 'Test File ' + Date.now(),
      sketchshaper_pro_category_id: categoryId,
      totalChunks: 5,
      totalSize: 26214400, // 25MB
      originalFilename: 'test-file.skp'
    });

    console.log('✅ Upload initialized:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 5: Upload Chunk (Simulated)
async function testUploadChunk(uploadSessionId) {
  console.log('\n5️⃣ Testing: Upload Chunk');
  try {
    // Create a dummy chunk (1MB of data)
    const chunkData = Buffer.alloc(1024 * 1024, 'a');
    
    const formData = new FormData();
    formData.append('uploadSessionId', uploadSessionId);
    formData.append('chunkIndex', '0');
    formData.append('chunk', chunkData, { filename: 'chunk_0' });

    const response = await axios.post(`${BASE_URL}/sketchshaper-pro-files/upload-chunk`, formData, {
      headers: formData.getHeaders()
    });

    console.log('✅ Chunk uploaded:', response.data.data);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 6: Get Upload Status
async function testGetUploadStatus(uploadSessionId) {
  console.log('\n6️⃣ Testing: Get Upload Status');
  try {
    const response = await axios.get(`${BASE_URL}/sketchshaper-pro-files/status/${uploadSessionId}`);
    console.log('✅ Upload status:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 7: Get Files with Pagination
async function testGetFiles() {
  console.log('\n7️⃣ Testing: Get Files with Pagination');
  try {
    const response = await axios.get(`${BASE_URL}/sketchshaper-pro-files/pages?page=1&limit=10&order=desc`);
    console.log('✅ Files retrieved:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 8: Cancel Upload
async function testCancelUpload(uploadSessionId) {
  console.log('\n8️⃣ Testing: Cancel Upload');
  try {
    const response = await axios.delete(`${BASE_URL}/sketchshaper-pro-files/cancel/${uploadSessionId}`);
    console.log('✅ Upload cancelled:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting tests...\n');
  console.log('📍 Base URL:', BASE_URL);
  console.log('─'.repeat(50));

  // Test 1: Create Category
  const categoryId = await testCreateCategory();
  if (!categoryId) {
    console.log('\n⚠️  Cannot continue without category ID');
    return;
  }

  // Test 2: Get Categories
  await testGetCategories();

  // Test 3: Get Categories with Pagination
  await testGetCategoriesWithPagination();

  // Test 4: Initialize Upload
  const uploadData = await testInitializeUpload(categoryId);
  if (!uploadData) {
    console.log('\n⚠️  Cannot continue without upload session');
    return;
  }

  // Test 5: Upload Chunk
  await testUploadChunk(uploadData.uploadSessionId);

  // Test 6: Get Upload Status
  await testGetUploadStatus(uploadData.uploadSessionId);

  // Test 7: Get Files
  await testGetFiles();

  // Test 8: Cancel Upload (cleanup)
  await testCancelUpload(uploadData.uploadSessionId);

  console.log('\n' + '─'.repeat(50));
  console.log('✅ All tests completed!\n');
  console.log('📝 Notes:');
  console.log('   - This is a basic test of API endpoints');
  console.log('   - For full upload test, use the React component');
  console.log('   - Check SKETCHSHAPER_PRO_API_DOCUMENTATION.md for details');
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
  process.exit(1);
});
