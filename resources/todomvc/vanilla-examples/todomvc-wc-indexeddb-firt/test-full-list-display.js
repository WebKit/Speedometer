/**
 * Test for the full list display requirement:
 * "If there are more todos than those allowed in the UI, then the UI should be showing a full list"
 */

async function testFullListDisplayRequirement() {
    console.log('🧪 Testing Full List Display Requirement');
    
    // Create TodoApp instance
    const todoApp = document.createElement('todo-app');
    document.body.appendChild(todoApp);
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📝 Adding initial todos (less than page capacity)...');
    
    // Add initial todos (less than page capacity of 10)
    for (let i = 1; i <= 5; i++) {
        const addEvent = new CustomEvent('add-item', {
            detail: {
                id: `todo-${i}`,
                title: `Todo item ${i}`,
                completed: false
            }
        });
        todoApp.topbar.dispatchEvent(addEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('✅ Added 5 todos - checking current UI state...');
    const listWrapper = todoApp.listWrapper;
    const onScreenList = listWrapper.wrapperNode.children[0];
    
    console.log(`Current on-screen count: ${onScreenList.getCurrentCount()}`);
    console.log(`Available slots: ${onScreenList.getAvailableSlots()}`);
    console.log(`Is full: ${onScreenList.isFull()}`);
    
    console.log('📝 Adding more todos to exceed UI capacity...');
    
    // Add more todos to exceed the UI capacity (10 items)
    for (let i = 6; i <= 15; i++) {
        const addEvent = new CustomEvent('add-item', {
            detail: {
                id: `todo-${i}`,
                title: `Todo item ${i}`,
                completed: false
            }
        });
        todoApp.topbar.dispatchEvent(addEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('✅ Added 15 todos total - checking if UI shows full list...');
    
    // Wait for ensureFullListDisplay to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalOnScreenCount = onScreenList.getCurrentCount();
    const maxCapacity = onScreenList.getMaxCapacity();
    const isFull = onScreenList.isFull();
    
    console.log(`Final on-screen count: ${finalOnScreenCount}`);
    console.log(`Max capacity: ${maxCapacity}`);
    console.log(`Is full: ${isFull}`);
    
    // Test the requirement
    if (isFull && finalOnScreenCount === maxCapacity) {
        console.log('✅ REQUIREMENT MET: UI is showing a full list when more todos are available');
        console.log(`✅ UI displays ${finalOnScreenCount}/${maxCapacity} items (full capacity)`);
    } else {
        console.log('❌ REQUIREMENT NOT MET: UI is not showing a full list');
        console.log(`❌ UI displays ${finalOnScreenCount}/${maxCapacity} items`);
    }
    
    // Test IndexedDB storage
    const { indexedDBService } = await import('./src/utils/indexeddb-service.js');
    const totalInDB = await indexedDBService.getTodoCount('all');
    console.log(`Total todos in IndexedDB: ${totalInDB}`);
    
    if (totalInDB >= 15) {
        console.log('✅ All todos properly stored in IndexedDB');
    } else {
        console.log('❌ Not all todos stored in IndexedDB');
    }
    
    // Test adding one more item to verify ensureFullListDisplay is called
    console.log('📝 Adding one more todo to test ensureFullListDisplay...');
    const addEvent = new CustomEvent('add-item', {
        detail: {
            id: 'todo-16',
            title: 'Todo item 16',
            completed: false
        }
    });
    todoApp.topbar.dispatchEvent(addEvent);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const afterAddCount = onScreenList.getCurrentCount();
    console.log(`After adding 16th todo, on-screen count: ${afterAddCount}`);
    
    if (afterAddCount === maxCapacity) {
        console.log('✅ UI maintained full capacity after adding overflow item');
    } else {
        console.log('❌ UI did not maintain full capacity');
    }
    
    console.log('🧪 Full List Display Test Complete');
}

// Run the test when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testFullListDisplayRequirement, 1000);
});
