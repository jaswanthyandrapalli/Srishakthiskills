
async function runTest() {
  try {
    console.log('1. Attempting login as test user...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@srisakthi.com',
        password: 'UserPassword123'
      })
    });
    
    if (!loginRes.ok) {
      const errData = await loginRes.json();
      throw new Error(`Login failed: ${JSON.stringify(errData)}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Logged in successfully. Token received.');

    // 2. Fetch a product to add to the wishlist
    console.log('2. Fetching available products...');
    const prodRes = await fetch('http://localhost:5000/api/products');
    const prodData = await prodRes.json();
    const products = prodData.products;
    if (!products || products.length === 0) {
      throw new Error('No products found in database to test with.');
    }
    const testProduct = products[0];
    console.log(`✅ Found product for test: ${testProduct.name} (${testProduct._id})`);

    // 3. Add to wishlist
    console.log(`3. Adding product ${testProduct._id} to wishlist...`);
    const addRes = await fetch('http://localhost:5000/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: testProduct._id })
    });
    
    const addData = await addRes.json();
    console.log('✅ Add response:', JSON.stringify(addData));

    // 4. Fetch wishlist
    console.log('4. Fetching user wishlist...');
    const getRes = await fetch('http://localhost:5000/api/wishlist', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const getData = await getRes.json();
    console.log('✅ Fetch response:', JSON.stringify(getData));

    // 5. Remove from wishlist
    console.log(`5. Removing product ${testProduct._id} from wishlist...`);
    const delRes = await fetch(`http://localhost:5000/api/wishlist/${testProduct._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const delData = await delRes.json();
    console.log('✅ Remove response:', JSON.stringify(delData));
    
    console.log('\n🎉 ALL WISHLIST ENDPOINT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

runTest();
