// ==========================================
// INDEXEDDB DOCUMENT STORAGE
// ==========================================

class DocumentStorage {
    constructor() {
        this.dbName = 'SecureSignDB';
        this.storeName = 'documents';
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    objectStore.createIndex('userEmail', 'userEmail', { unique: false });
                }
            };
        });
    }

    async saveDocument(userEmail, document) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const docData = {
                ...document,
                userEmail: userEmail,
                id: document.id || this.generateDocId()
            };
            
            const request = store.put(docData);
            request.onsuccess = () => {
                console.log('Document saved to IndexedDB:', docData.name);
                resolve(docData);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getUserDocuments(userEmail) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('userEmail');
            const request = index.getAll(userEmail);
            
            request.onsuccess = () => {
                console.log('Retrieved documents from IndexedDB:', request.result.length);
                resolve(request.result || []);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getDocument(docId) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(docId);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteDocument(docId) {
        await this.init();
        return new Promise(async (resolve, reject) => {
            try {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                
                // First check if document exists
                const getRequest = store.get(docId);
                
                getRequest.onsuccess = () => {
                    const doc = getRequest.result;
                    
                    if (!doc) {
                        console.log('Document not found:', docId);
                        resolve(false);
                        return;
                    }
                    
                    // Document exists, now delete it
                    const deleteRequest = store.delete(docId);
                    
                    deleteRequest.onsuccess = () => {
                        console.log('Document deleted successfully from IndexedDB:', docId);
                        resolve(true);
                    };
                    
                    deleteRequest.onerror = () => {
                        console.error('Error deleting document:', deleteRequest.error);
                        reject(deleteRequest.error);
                    };
                };
                
                getRequest.onerror = () => {
                    console.error('Error checking document:', getRequest.error);
                    reject(getRequest.error);
                };
                
            } catch (error) {
                console.error('Error in deleteDocument:', error);
                reject(error);
            }
        });
    }

    async deleteAllUserDocuments(userEmail) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('userEmail');
            const request = index.openCursor(IDBKeyRange.only(userEmail));
            
            let deletedCount = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    cursor.continue();
                } else {
                    console.log(`Deleted ${deletedCount} documents for user:`, userEmail);
                    resolve(deletedCount);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    generateDocId() {
        return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

const documentStorage = new DocumentStorage();