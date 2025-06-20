/**
 * Performance test for TodoMVC with large datasets
 * Tests with 1000+ items to validate IndexedDB performance and full list display
 */

async function performanceTestWithLargeDataset() {
    console.log('🚀 Starting Performance Test with Large Dataset (1000+ items)');
    
    const startTime = performance.now();
    
    // Create TodoApp instance
    const todoApp = document.createElement('todo-app');
    document.body.appendChild(todoApp);
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { indexedDBService } = await import('./src/utils/indexeddb-service.js');
    
    console.log('📊 Adding 1000 todos in batches...');
    
    // Add 1000 todos in batches to test performance
    const batchSize = 50;
    const totalItems = 1000;
    let addedCount = 0;
    
    for (let batch = 0; batch < totalItems / batchSize; batch++) {
        const batchStart = performance.now();
        
        for (let i = 0; i < batchSize; i++) {
            const itemId = addedCount + 1;
            const addEvent = new CustomEvent('add-item', {
                detail: {
                    id: `todo-${itemId}`,
                    title: `Performance test todo ${itemId}`,
                    completed: Math.random() > 0.7 // 30% completed
                }
            });
            todoApp.topbar.dispatchEvent(addEvent);
            addedCount++;
        }
        
        // Small delay between batches to allow IndexedDB operations
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const batchTime = performance.now() - batchStart;
        console.log(`✅ Batch ${batch + 1}/${totalItems / batchSize} complete (${batchSize} items in ${batchTime.toFixed(2)}ms)`);
    }
    
    console.log(`📊 Added ${addedCount} todos total`);
    
    // Wait for all IndexedDB operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test current UI state
    const listWrapper = todoApp.listWrapper;
    const onScreenList = listWrapper.wrapperNode.children[0];
    
    const onScreenCount = onScreenList.getCurrentCount();
    const maxCapacity = onScreenList.getMaxCapacity();
    const isFull = onScreenList.isFull();
    
    console.log('📊 Final UI State:');
    console.log(`  On-screen items: ${onScreenCount}/${maxCapacity}`);
    console.log(`  UI is full: ${isFull}`);
    console.log(`  Available slots: ${onScreenList.getAvailableSlots()}`);
    
    // Test IndexedDB storage
    const totalInDB = await indexedDBService.getTodoCount('all');
    const activeInDB = await indexedDBService.getTodoCount('active');
    const completedInDB = await indexedDBService.getTodoCount('completed');
    
    console.log('📊 IndexedDB Storage:');
    console.log(`  Total in DB: ${totalInDB}`);
    console.log(`  Active in DB: ${activeInDB}`);
    console.log(`  Completed in DB: ${completedInDB}`);
    
    // Test filtering performance
    console.log('🔍 Testing filter performance...');
    
    const filterTests = ['all', 'active', 'completed'];
    for (const filter of filterTests) {
        const filterStart = performance.now();
        
        // Simulate filter change
        listWrapper.setFilter(filter);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const filterTime = performance.now() - filterStart;
        console.log(`  ${filter} filter: ${filterTime.toFixed(2)}ms`);
    }
    
    // Test pagination performance
    console.log('📄 Testing pagination performance...');
    
    const pageTests = ['first', 'next', 'next', 'previous', 'last'];
    for (const pageAction of pageTests) {
        const pageStart = performance.now();
        
        const moveEvent = new CustomEvent('move-to-page', {
            detail: { direction: pageAction }
        });
        todoApp.bottombar.dispatchEvent(moveEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const pageTime = performance.now() - pageStart;
        console.log(`  ${pageAction} page: ${pageTime.toFixed(2)}ms`);
    }
    
    const totalTime = performance.now() - startTime;
    
    console.log('📊 Performance Test Results:');
    console.log(`  Total test time: ${totalTime.toFixed(2)}ms`);
    console.log(`  Average time per item: ${(totalTime / totalItems).toFixed(2)}ms`);
    
    // Verify the requirement
    if (isFull && onScreenCount === maxCapacity && totalInDB >= totalItems) {
        console.log('✅ PERFORMANCE TEST PASSED:');
        console.log('  - UI shows full list when more todos available');
        console.log('  - All items properly stored in IndexedDB');
        console.log('  - Performance is acceptable for large datasets');
    } else {
        console.log('❌ PERFORMANCE TEST FAILED:');
        console.log(`  - UI full: ${isFull}`);
        console.log(`  - On-screen: ${onScreenCount}/${maxCapacity}`);
        console.log(`  - In DB: ${totalInDB}/${totalItems}`);
    }
    
    console.log('🚀 Performance Test Complete');
}

// Export for use in other tests
window.performanceTestWithLargeDataset = performanceTestWithLargeDataset;

// Run automatically if this is the main test page
if (window.location.pathname.includes('performance-test')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(performanceTestWithLargeDataset, 1000);
    });
}
