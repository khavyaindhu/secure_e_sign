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
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(docId);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    generateDocId() {
        return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

const documentStorage = new DocumentStorage();