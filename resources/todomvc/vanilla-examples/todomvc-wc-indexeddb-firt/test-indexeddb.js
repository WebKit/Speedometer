/**
 * Simple test file to verify IndexedDB functionality
 * This can be run in the browser console or included as a test script
 */

import { indexedDBService } from './src/utils/indexeddb-service.js';

// Test function to verify IndexedDB functionality
async function testIndexedDBService() {
    console.log('Testing IndexedDB Service...');
    
    try {
        // Initialize the service
        await indexedDBService.initialize();
        console.log('✅ IndexedDB initialized successfully');
        
        // Test adding a todo
        const testTodo = {
            id: 'test-1',
            title: 'Test Todo Item',
            completed: false,
            createdAt: Date.now()
        };
        
        await indexedDBService.addTodo(testTodo);
        console.log('✅ Todo added successfully');
        
        // Test getting todos for a page
        const todos = await indexedDBService.getTodosForPage(0, 10, 'all');
        console.log('✅ Todos retrieved:', todos);
        
        // Test updating todo
        testTodo.completed = true;
        await indexedDBService.updateTodo(testTodo);
        console.log('✅ Todo updated successfully');
        
        // Test getting count
        const count = await indexedDBService.getTodoCount('all');
        console.log('✅ Total todos count:', count);
        
        // Test removing todo
        await indexedDBService.removeTodo(testTodo.id);
        console.log('✅ Todo removed successfully');
        
        console.log('🎉 All IndexedDB tests passed!');
        
    } catch (error) {
        console.error('❌ IndexedDB test failed:', error);
    }
}

// Export for manual testing
window.testIndexedDBService = testIndexedDBService;

// Auto-run test when module is loaded (uncomment if needed)
// testIndexedDBService();

console.log('IndexedDB test module loaded. Run testIndexedDBService() to test.');
