const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

async function testEventsAPI() {
  try {
    console.log('Testing Events API...');
    
    // Test basic GET /events
    const response = await axios.get(`${API_BASE_URL}/events`);
    console.log('✅ GET /events successful:', {
      status: response.status,
      itemsCount: response.data?.data?.items?.length || 0,
      pagination: response.data?.data?.pagination
    });
    
  } catch (error) {
    console.error('❌ Error testing events API:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
}

testEventsAPI();
